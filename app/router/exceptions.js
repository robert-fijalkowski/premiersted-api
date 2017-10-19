class BadRequest extends Error {}
class NotFound extends Error {}
class Conflict extends Error {}
const error = (kind) => { throw kind; };


module.exports = {
  BadRequest, NotFound, Conflict, error,
};

