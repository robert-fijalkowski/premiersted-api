const { users, competitors, games } = require('../../db');

const LRU = require('lru-cache');
const R = require('ramda');

const cache = LRU({ maxAge: 1000 * 60, max: 100 });

const userDetails = async ({ id }) => {
  const user = await users.findById(id);
  const gamesIdsList = R.map(R.prop('gid'))(await competitors.find({ uid: user.id }));
  const gamesList = await games.teasers(gamesIdsList);
  return { ...user, games: gamesList };
};

module.exports = { async cachedFind({ id }) {
  return userDetails(id);
},
async get(q) {
  return R.cond([
    [R.prop('id'), userDetails],
    [R.T, async () => users.getAll()],
  ])(q);
},
async update({ id, body }) {
  await Promise.all([
    users.updateMeta({ ...body, id }),
    users.setAccess({ ...body, id }),
  ]);
  return users.findById(id);
} };

