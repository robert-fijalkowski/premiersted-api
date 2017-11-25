const R = require('ramda');
const { createGame, completeGame } = require('./operations');

const playerWithClub = ({ club }, id) => ({
  uid: id,
  club: club.id,
});

const getGamesToCreate = (game, name) => {
  const withClub = R.mapObjIndexed(playerWithClub, game.competitors);
  return {
    name,
    location: game.location,
    competitors: R.values(withClub),
  };
};

module.exports = {
  meta: {
    id: 'nosplit',
    name: 'no splitting, pass all to next game',
    isValidStructure: ({ continueIn }) => {
      if (!R.is(String, continueIn)) {
        throw new Error('Invalid structure, continueIn must be a string');
      }
      return true;
    },
  },
  exec: async ({ game, args: { continueIn } }) => {
    const newGame = getGamesToCreate(game, continueIn);
    return [completeGame({ id: game.id }), createGame(newGame)];
  },
};

