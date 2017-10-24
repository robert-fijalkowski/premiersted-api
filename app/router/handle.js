/* eslint-disable global-require */
const { equals } = require('ramda');
const { NotFound } = require('./exceptions');

module.exports = ((req, res, next) => {
  res.handle = async (resultP, ifSuccess) => {
    try {
      const result = resultP instanceof Function ? await (resultP()) : await resultP;
      if (!result || equals(result, {})) {
        if (req.method !== 'GET') {
          return res.status(200).send();
        }
        return next(new NotFound());
      }
      if (ifSuccess) {
        return ifSuccess();
      }
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  };
  next();
});

