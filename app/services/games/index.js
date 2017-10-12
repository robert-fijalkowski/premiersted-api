const {
  games, competitors, contests,
} = require('../../db');

const R = require('ramda');

const detailedGame = async ({ id }) => {
  const game = await games.findById(id);
  if (!game) {
    return null;
  }
  const comps = await competitors.find({ gid: id });
  return {
    ...game,
    competitors: comps,
  };
};

const deleteGame = async ({ id }) => {
  await Promise.all([
    games.delete(id),
    competitors.delete({ gid: id }),
    contests.delete({ gid: id }),
  ]);
  return {};
};
module.exports = {
  get(o) {
    return R.cond([
      [R.prop('id'), detailedGame],
      [R.anyPass([R.prop('limit'), R.prop('name'), R.prop('status'), R.prop('location')]), async by => games.findBy(by)],
      [R.T, async () => games.getAll()],
    ])(o);
  },
  async delete(o) {
    return R.cond([
      [R.prop('id'), deleteGame],
      [R.T, R.always({})],
    ])(o);
  },
  async addCompetitor(id, {
    uid, club,
  }) {
    competitors.add({
      gid: id, uid, club,
    });
  },
  async create(o) {
    return games.create(o);
  },
  async update(o) {
    return games.update(o).then(({ id }) => this.get({ id }));
  },
  async schedule({ gid }) {
    const gamePlayers = await competitors.find({ gid });
    const matches = R.pipe(
      R.filter(([left, right]) => left.uid !== right.uid),
      R.uniq,
    )(R.xprod(gamePlayers, gamePlayers));
  },
};

