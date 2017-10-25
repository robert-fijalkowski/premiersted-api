const { games, competitors, contests } = require('../../db');

const rules = require('./rules');
const detailedGame = require('./detailedGame');
const schedule = require('./schedule');
const results = require('./results');

const R = require('ramda');

const deleteGame = async ({ id }) => {
  await Promise.all([
    games.delete(id),
    competitors.delete({ gid: id }),
    contests.delete({ gid: id }),
  ]);
  return {};
};
module.exports = {
  async exists(id) {
    return !!await games.findById(id);
  },
  get(o) {
    return R.cond([
      [R.prop('gid'), detailedGame],
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
  async addCompetitor(gid, { uid, club }) {
    await rules.addCompetitor({ gid, uid, club });
    return competitors.add({ gid, uid, club }).then(() => detailedGame({ gid }));
  },
  async delCompetitor(gid, { uid, club }) {
    return competitors.delete({ gid, uid, club }).then(() => detailedGame({ gid }));
  },
  async create(o) {
    return games.create(o);
  },
  async update(update) {
    const filteredFields = R.omit(['competitors', 'schedule'], update);
    return games.update(filteredFields).then(() => detailedGame({ gid: update.id }));
  },
  ...schedule,
  ...results,
};

