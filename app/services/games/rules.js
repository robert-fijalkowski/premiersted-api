const { competitors, games, contests } = require('../../db');
const R = require('ramda');
const { Conflict, withError } = require('../../router/exceptions');

const isInt = (value) => {
  if ((parseFloat(value) == parseInt(value, 10)) && !isNaN(value)) { // eslint-disable-line
    return true;
  }
  return false;
};
const not = R.complement;
module.exports = {
  addCompetitor: async ({ gid, club, uid }) => {
    const list = (await competitors.find({ gid, club })).filter(f => f.uid !== uid);
    const [{ status }] = await games.teasers([gid]);
    return R.cond([
      [not(R.pipe(R.prop('list'), R.isEmpty)), withError(new Conflict('This club has been already chosen'))],
      [not(R.propEq('status', 'OPEN')), withError(new Conflict('This competitions already started'))],
      [R.T, R.T],
    ])({ list, status });
  },
  schedule: async ({ gid, schedule }) => {
    const game = await games.findById(gid);
    return R.cond([
      [not(R.pathEq(['game', 'status'], 'OPEN')), withError(new Conflict('Game must be in OPEN state'))],
      [R.pipe(R.prop('schedule'), R.isEmpty), withError(new Conflict('Game must contains at least 2 competitors'))],
      [R.T, R.T],
    ])({ game, schedule });
  },
  result: async ({
    id, gid, result, status,
  }) => {
    const game = await games.findById(gid);
    const contest = await contests.findById({ id });
    const isNumber = field => R.pipe(R.path(['result', field]), R.both(isInt, R.gte(R.__, 0)));
    return R.cond([
      [not(R.pathEq(['game', 'status'], 'ONGOING')), withError(new Conflict('Game must be in ONGOING state'))],
      [not(R.pathEq(['contest', 'gid'], gid)), withError(new Conflict('Trying to update unrelated contest'))],
      [not(R.pathEq(['contest', 'status'], 'SCHEDULED')), withError(new Conflict('Related contest must be in SCHEDULED state'))],
      [not(R.both(isNumber('visitor'), isNumber('home'))), withError(new Conflict('Result values must be an non-negative integer'))],
      [not(R.pipe(R.prop('status'), R.contains(R.__, ['PLAYED', 'WALKOVER']))), withError(new Conflict('aa'))],
      [R.T, R.T],
    ])({
      game, contest, result, status,
    });
  },
};
