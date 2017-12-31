const { games, competitors, contests } = require('../../db');
const R = require('ramda');

const rules = require('./rules');
const detailedGame = require('./detailedGame');
const schedule = require('./schedule');
const results = require('./results');
const table = require('./table');

const complete = require('./complete');
const teaser = require('./teaser');
const contest = require('./contest');

const deleteGame = async ({ id }) => {
  await Promise.all([games.delete(id)]);
  return {};
};

const listView = require('./listView');

module.exports = {
  teaser,
  async exists(id) {
    return !!await games.findById(id);
  },
  get(o) {
    return R.cond([
      [R.prop('gid'), detailedGame],
      [
        R.anyPass([R.prop('limit'), R.prop('name'), R.prop('status'), R.prop('location')]),
        async by => games.findBy(by).then(listView),
      ],
      [R.T, async () => games.getAll(o).then(listView)],
    ])(o);
  },
  async delete({ id }) {
    await rules.completeGame({ gid: id });
    return R.cond([[R.prop('id'), deleteGame], [R.T, R.always({})]])({ id });
  },
  async addCompetitor(gid, { uid, club }) {
    await rules.addCompetitor({ gid, uid, club });
    await competitors.add({ gid, uid, club });
    await table.updateTable({ gid });
    return detailedGame({ gid });
  },
  async delCompetitor(gid, { uid }) {
    await rules.deleteCompetitor({ gid, uid });
    await competitors.delete({ gid, uid });
    await table.updateTable({ gid });
    return detailedGame({ gid });
  },
  async create(o) {
    return games.create(o).then(({ id }) => detailedGame({ gid: id }));
  },
  async update(id, update) {
    const game = await games.findById(id);
    const filteredFields = R.omit(
      ['competitors', 'schedule', 'gid', 'table', 'parent', 'continueIn', 'players'],
      update,
    );
    return games
      .update({ ...game, ...filteredFields })
      .then(() => detailedGame({ gid: update.id }));
  },
  async contestTeaser({ cid }) {
    return contests.findById({ id: cid });
  },
  ...contest,
  ...schedule,
  ...results,
  ...table,
  complete,
};
