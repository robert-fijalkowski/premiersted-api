const {
  games, competitors, contests,
} = require('../../db');
const randomatic = require('randomatic');

const users = require('../users');

const R = require('ramda');

const rematchMatchId = (match, matches) => R.prop('id', R.find(R.both(
  R.propEq('home', match.away),
  R.propEq('away', match.home),
))(matches));

const supplyNewFields = matches => R.map((match) => {
  const rematch = rematchMatchId(match, matches);
  const now = new Date().toUTCString();
  return {
    ...match,
    rematch,
    scheduled: now,
    updated: now,
  };
}, matches);

module.exports = {
  async prepareSchedule({ gid }) {
    const gamePlayers = R.pluck('uid', await competitors.find({ gid }));
    const newId = () => randomatic('Aa0', 6);
    return R.pipe(
      R.filter(([left, right]) => left !== right),
      R.uniq,
      R.map(([home, away]) => ({ id: newId(), home, away })),
      supplyNewFields,
    )(R.xprod(gamePlayers, gamePlayers));
  },
  saveSchedule({ gid, schedule }) {

  },
};

