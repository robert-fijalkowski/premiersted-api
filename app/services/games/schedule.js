const { games, competitors, contests } = require('../../db');
const randomatic = require('randomatic');
const rules = require('./rules');
const table = require('./table');
const detailedGame = require('./detailedGame');

const R = require('ramda');

const rematchMatchId = (match, matches) => R.prop('id', R.find(R.both(
  R.propEq('home', match.visitor),
  R.propEq('visitor', match.home),
))(matches));

const supplyNewFields = matches => R.map((match) => {
  const rematch = rematchMatchId(match, matches);
  const now = new Date().toString();
  return {
    ...match,
    rematch,
    scheduled: now,
    updated: now,
  };
}, matches);

const prepareSchedule = async ({ gid }) => {
  const gamePlayers = R.pluck('uid', await competitors.find({ gid }));
  const newId = () => randomatic('Aa0', 6);
  return R.pipe(
    R.filter(([left, right]) => left !== right),
    R.uniq,
    R.map(([home, visitor]) => ({ id: newId(), home, visitor })),
    supplyNewFields,
  )(R.xprod(gamePlayers, gamePlayers));
};


const saveSchedule = async ({ gid, schedule }) => {
  const game = await games.findById(gid);
  try {
    await Promise.all(schedule.map(contest => contests.create({ ...contest, gid })));
    await games.update({ ...game, status: 'ONGOING' });
  } catch (e) {
    await games.update({ ...game, status: 'OPEN' });
  }
};

module.exports = {
  async makeSchedule({ gid }) {
    const schedule = await prepareSchedule({ gid });
    await rules.schedule({ gid, schedule });
    await saveSchedule({ gid, schedule });
    await table.updateTable({ gid });
    return detailedGame({ gid });
  },
  async prepareSchedule({ gid }) {
    const schedule = await prepareSchedule({ gid });
    await rules.schedule({ gid, schedule });
    return schedule;
  },
};

