/* eslint-disable global-require */
const { equals } = require('ramda');
const { NotFound } = require('./exceptions');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.handle = async (resultP) => {
      const result = await resultP;
      if (!result || equals(result, {})) {
        return next(new NotFound());
      }
      return res.json(result);
    };
    next();
  });

  app.use('/users', require('./users'));
  app.use('/games', require('./games'));
  app.use('/clubs', require('./clubs'));
  app.use(require('./error'));
};

