const { games, competitors, contests } = require('../../db');
const R = require('ramda');

const rules = require('./rules');
const cachedFind = require('../users/cachedFind');
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

const fetchUsersFromTable = async (game) => {
  const players = await Promise.all(R.pipe(R.pluck('id'), R.map(id => cachedFind({ id })))(game.table));
  return { ...game, players };
};
const fromCompetitorsList = async (game) => {
  const listOfCompetitors = await competitors.find({ gid: game.id });
  const players = await Promise.all(R.pipe(R.pluck('uid'), R.map(id => cachedFind({ id })))(listOfCompetitors));
  return { ...game, players };
};
const listView = async (list) => {
  const a = R.cond([[R.has('table'), fetchUsersFromTable], [R.T, fromCompetitorsList]]);
  return Promise.all(R.map(a, list));
};

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
    return competitors.add({ gid, uid, club }).then(() => detailedGame({ gid }));
  },
  async delCompetitor(gid, { uid }) {
    await rules.deleteCompetitor({ gid, uid });
    return competitors.delete({ gid, uid }).then(() => detailedGame({ gid }));
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
      .update({ ...filteredFields, ...game })
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
