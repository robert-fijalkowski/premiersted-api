const R = require('ramda');

const actions = {
  createGame: Symbol('createGame'),
  completeGame: Symbol('completeGame'),
};

const isCompleteGame = R.propEq('action', actions.completeGame);

const isCreateGame = R.propEq('action', actions.createGame);
module.exports = {
  actions,
  createGame: ({ name, location, competitors = [] }) => ({
    action: actions.createGame,
    item: { name, location, competitors },
  }),
  completeGame: ({ id }) => ({
    action: actions.completeGame,
    item: { id },
  }),
  isCompleteGame,
  isCreateGame,
  parseChanges: changes => ({
    toComplete: R.find(isCompleteGame, changes),
    toCreate: R.filter(isCreateGame, changes),
  }),
};

