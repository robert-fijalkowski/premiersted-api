const { competitors, games } = require('../../db');
const R = require('ramda');
const { Conflict, withError } = require('../../router/exceptions');

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
      [R.complement(R.pathEq(['game', 'status'], 'OPEN')), withError(new Conflict('Game must be in OPEN state'))],
      [R.pipe(R.prop('schedule'), R.isEmpty), withError(new Conflict('Game must contains at least 2 competitors'))],
      [R.T, R.T],
    ])({ game, schedule });
  },
  result: async ({ result }) => {

  },
};
