const {
  users, competitors, games, contests,
} = require('../../db');

const Cache = require('../../utils/cache');
const R = require('ramda');

const cache = Cache({ maxAge: 1000 * 60, max: 100 });

const cachedFind = async ({ id }) => cache.getOrSet(id, async () => {
  const { meta: { avatar_url, name } } = await users.findById(id, ['users']);
  return { id, name, avatar_url };
});

const contestDetails = async (c) => {
  const [visitor, home] = await Promise.all([
    cachedFind({ id: c.visitor }),
    cachedFind({ id: c.home }),
  ]);
  return { ...c, visitor, home };
};
const promiseAll = pList => Promise.all(pList);
const userDetails = async ({ id }) => {
  const user = await users.findById(id);
  if (!user) return null;
  const gamesIdsList = R.map(R.prop('gid'))(await competitors.find({ uid: user.id }));
  const [contestsList, gamesList] =
  await Promise.all([
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
    return !!(await users.findById(id));
  },
  async get(q) {
    return R.cond([
      [R.prop('id'), userDetails],
      [R.T, async () => users.getAll()],
    ])(q);
  },
  async getAccess({ id }) {
    return users.getAccess(id);
  },
  async update({ id, body }) {
    await Promise.all([
      users.updateMeta({
        ...body, id,
      }),
      users.setAccess({
        ...body, id,
      }),
    ]);
    return users.findById(id);
  },
};

