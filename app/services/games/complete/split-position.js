const R = require('ramda');
const { createGame, completeGame } = require('./operations');

const toAdvanceWithClub = game =>
  ({ id }) => ({
    uid: id,
    club: R.path(['competitors', id, 'club', 'id'], game),
  });

const getGamesToCreate = (game) => {
  const withClub = toAdvanceWithClub(game);
  return R.map(({ name, from, to = R.last(game.table).position }) => ({
    name,
    location: game.location,
    competitors:
    R.pipe(
      R.filter(R.pipe(
        R.prop('position'),
        R.both(R.lte(from), R.gte(to)),
      )),
      R.map(withClub),
    )(game.table),
  }));
};

module.exports = {
  meta: {
    id: 'position',
    name: 'split by positions',
    isValidStructure: ({ continueIn }) => {
      if (!R.is(Array, continueIn) || R.isEmpty(continueIn)) {
        throw new Error('Invalid structure');
      }
      // further checks needed
      return true;
    },
  },
  exec: async ({ game, args: { continueIn } }) => {
    const newGames = getGamesToCreate(game)(continueIn);
    const patches = R.map(createGame, newGames);
    return [completeGame({ id: game.id }), ...patches];
  },
};

