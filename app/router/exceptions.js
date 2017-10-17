class BadRequest extends Error {}
class NotFound extends Error {}
const error = (kind) => { throw kind; };
module.exports = {
  BadRequest, NotFound, error,
};

