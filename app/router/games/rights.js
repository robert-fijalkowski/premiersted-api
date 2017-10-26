const { games } = require('../../services');
const { NotFound, BadRequest, withError } = require('../exceptions');
const { protectLevel } = require('../../utils/jwt');

const onlyAdmin = protectLevel('ADMIN');

const gameExists = async (req, res, next) => {
  const { id } = req.params;
  const exists = await games.exists(req.params.id);
  if (exists) { return next(); }
  return res.handle(withError(new NotFound(`Game ${id} does not exists`)));
};

const myContestOrAdmin = async (req, res, next) => {
  const { params: { id, cid } } = req;
  const userId = req.user.id;
  const { gid, visitor, home } = await games.contest({ cid });
  if (gid !== id) {
    return res.handle(withError(new BadRequest(`Contest ${cid} unrelated to game ${id}`)));
  }
  if ([visitor, home].includes(userId)) {
    return next();
  }
  return onlyAdmin(req, res, next);
};

module.exports = {
  gameExists,
  myContestOrAdmin,
  onlyAdmin,
};
