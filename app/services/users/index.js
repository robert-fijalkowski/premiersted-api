const {
  users, competitors, games, contests,
} = require('../../db');
const { contest } = require('../games/contest');
const R = require('ramda');
const cachedFind = require('./cachedFind');

const contestDetails = async c => contest({ cid: c.id });
const promiseAll = pList => Promise.all(pList);
const userDetails = async ({ id }) => {
  const user = await users.findById(id);
  const gamesIdsList = R.map(R.prop('gid'))(await competitors.find({ uid: user.id }));
  const [contestsList, gamesList] = await Promise.all([
    contests.find({ uid: id }).then(R.pipe(R.map(contestDetails), promiseAll)),
    games.teasers(gamesIdsList).then(R.mapTo(R.prop('id'), R.identity)),
  ]);
  return {
    ...user,
    games: gamesList,
    contests: contestsList,
  };
};

module.exports = {
  cachedFind,
  async exists({ id }) {
    return !!await users.findById(id);
  },
  async get(q) {
    return R.cond([[R.prop('id'), userDetails], [R.T, async () => users.getAll()]])(q);
  },
  async getAccess({ id }) {
    return users.getAccess(id);
  },
  async update({ id, body }, { right }) {
    const user = await users.findById(id);
    await Promise.all([
      users.updateMeta({
        ...user,
        ...body,
        id,
      }),
      right === 'ADMIN' && body.access
        ? users.setAccess({
          access: body.access,
          id,
        })
        : [],
    ]);
    return users.findById(id);
  },
};
