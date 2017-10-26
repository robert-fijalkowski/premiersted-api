const { competitors, contests } = require('../../db');

const rules = require('./rules');
const table = require('./table');
const detailedGame = require('./detailedGame');

module.exports = {
  async postResult({
    id, gid, result, status, force, ...other
  }) {
    await rules.result({
      id, gid, result, status, force,
    });
    const contest = await contests.findById({ id });
    await contests.update({
      ...contest,
      ...other,
      result,
      status,
      edited: (force ? (contest.edited || 0) + 1 : contest.edited),
    });
    await table.updateTable({ gid });
    return detailedGame({ gid });
  },
};
