const { competitors } = require('../../db');
const R = require('ramda');
const { Conflict, withError } = require('../../router/exceptions');

module.exports = {
  addCompetitor: async ({ gid, club }) => {
    const list = await competitors.find({ gid, club });
    console.log(list);
    return R.ifElse(
      R.isEmpty,
      R.T,
      withError(new Conflict('This club has been already chosen')),
    )(list);
  },
};
