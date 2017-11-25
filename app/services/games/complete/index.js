/* eslint-disable global-require */
const R = require('ramda');
const detailedGame = require('../detailedGame');
const rules = require('../rules');
const applyChanges = require('./applyChanges');
const splits = [
  require('./split-byid'),
  require('./split-position'),
  require('./split-nosplit'),
];
const serialize = require('serialize-javascript');

const findSplitAlgorithm = id => R.find(R.pathEq(['meta', 'id'], id), splits);

const getChanges = async ({ exec, params: { gid, ...args } }) => {
  await rules.completeGame({ gid });
  const game = await detailedGame({ gid });
  return exec({ args, game });
};

module.exports = {
  exec: async (params) => {
    const algorithm = findSplitAlgorithm(params.split);
    if (!algorithm) {
      throw new Error(`Invalid algorithm ${params.split}`);
    }
    const { meta, exec } = algorithm;
    if (meta.isValidStructure(params)) {
      const changes = await getChanges({ exec, params });
      return applyChanges(changes);
    }
    throw new Error('Unknown Error');
  },
  scan: (params) => {
    const algorithm = findSplitAlgorithm(params.split);
    if (!algorithm) {
      return R.pipe(
        R.pluck('meta'),
        R.map(({ isValidStructure, ...rest }) => ({
          ...rest, isValidStructure: serialize(isValidStructure),
        })),
      )(splits);
    }
    const { meta, exec } = algorithm;

    if (meta.isValidStructure(params)) {
      return getChanges({ exec, params });
    }
    throw new Error('Unknown Error');
  },
};
