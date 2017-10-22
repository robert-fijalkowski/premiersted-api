const E = require('./exceptions');
const R = require('ramda');

module.exports = async (err, req, res, next) => {
  const use = R.always;
  const message = R.concat(': ', R.defaultTo(req.path, R.prop('message', err) || null));
  const { code, msg, payload } = R.cond([
    [R.is(E.BadRequest), use({ code: 400, msg: `Bad Request${message}` })],
    [R.is(E.NotFound), use({ code: 404, msg: `Not Found${message}` })],
    [R.is(E.Conflict), use({ code: 409, msg: `${message}` })],
    [R.T, use({ code: 500, msg: `Internal Server Error${message}` })],
  ])(await res.result || err);
  if (code >= 500) { // all codes below are under control
    console.error(err);
  }
  if (payload) {
    return res.status(code).json(payload);
  }
  res.status(code).send(msg);
  return next();
};

