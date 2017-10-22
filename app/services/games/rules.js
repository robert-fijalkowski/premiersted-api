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
      [not(R.propEq('status', 'OPEN')), withError(new Conflict('This game already started'))],
      [R.T, R.T],
    ])({ list, status });
  },
};
