const R = require('ramda');
const { createGame, completeGame } = require('./operations');


const getCurrentPlayers = R.pipe(R.prop('competitors'), R.keys);

const toAdvanceWithClub = game =>
  id => ({
    uid: id,
    club: R.path(['competitors', id, 'club', 'id'], game),
  });

const getGamesToCreate = (game) => {
  const currentPlayers = getCurrentPlayers(game);
  const withClub = toAdvanceWithClub(game);
  return R.map(({ name, competitors }) => ({
    name,
    location: game.location,
    competitors: R.pipe(
      R.intersection(currentPlayers),
      R.map(withClub),
    )(competitors),
  }));
};

module.exports = {
  meta: {
    id: 'byId',
    name: 'split by id',
    isValidStructure: ({ continueIn }) => {
      if (!R.is(Array, continueIn) || R.isEmpty(continueIn)) {
        throw new Error('Invalid structure');
      }
      return true;
    },
  },
  exec: async ({ game, args: { continueIn } }) => {
    const newGames = getGamesToCreate(game)(continueIn);
    const patches = R.map(createGame, newGames);
    // toAdvance.map(id => )
    return [completeGame({ id: game.id }), ...patches];
  },
};

