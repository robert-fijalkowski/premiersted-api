const { games, competitors, contests } = require('../../db');
const R = require('ramda');

const rules = require('./rules');
const detailedGame = require('./detailedGame');
const schedule = require('./schedule');
const results = require('./results');
const table = require('./table');
const users = require('../users');
const clubs = require('../clubs');
const complete = require('./complete');
const teaser = require('./teaser');

const deleteGame = async ({ id }) => {
  await Promise.all([
    games.delete(id),
  ]);
  return {};
};

module.exports = {
  teaser,
  async exists(id) {
    return !!await games.findById(id);
  },
  get(o) {
    return R.cond([
      [R.prop('gid'), detailedGame],
      [R.anyPass([R.prop('limit'), R.prop('name'), R.prop('status'), R.prop('location')]), async by => games.findBy(by)],
      [R.T, async () => games.getAll(o)],
    ])(o);
  },
  async delete({ id }) {
    await rules.completeGame({ gid: id });
    return R.cond([
      [R.prop('id'), deleteGame],
      [R.T, R.always({})],
    ])({ id });
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
    const filteredFields = R.omit([
      'competitors', 'schedule', 'gid',
      'table', 'parent', 'continueIn',
    ], update);
    return games.update({ ...filteredFields, ...game })
      .then(() => detailedGame({ gid: update.id }));
  },
  async contest({ cid }) {
    const contest = await contests.findById({ id: cid });
    const clubDetails = R.pipe(R.head, R.prop('club'), id => clubs.get({ id }));
    const { gid } = contest;
    const [homeClub, visitorClub, homeUser, visitorUser, editedBy] = await Promise.all([
      competitors.find({ gid, uid: contest.visitor }).then(clubDetails),
      competitors.find({ gid, uid: contest.home }).then(clubDetails),
      users.cachedFind({ id: contest.home }),
      users.cachedFind({ id: contest.visitor }),
      contest.editedBy ? users.cachedFind({ id: contest.editedBy }) : undefined,
    ]);
    return {
      ...contest,
      editedBy,
      home: { user: homeUser, club: homeClub },
      visitor: { user: visitorUser, club: visitorClub },
      gid: await teaser(gid),
    };
  },
  async contestTeaser({ cid }) {
    return contests.findById({ id: cid });
  },
  ...schedule,
  ...results,
  ...table,
  complete,
};

