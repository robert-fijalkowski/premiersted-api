const { competitors, contests } = require('../../db');

const rules = require('./rules');

const R = require('ramda');

module.exports = {
  async postResult({
    id, gid, result, status, ...other
  }) {
    await rules.result({
      id, gid, result, status,
    });
    const contest = await contests.findById({ id });
    return contests.update({
      ...contest, ...other, result, status,
    });
  },
};
