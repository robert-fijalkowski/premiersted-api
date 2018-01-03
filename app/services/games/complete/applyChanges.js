const db = require('../../../db');
const R = require('ramda');
const { systemEvent } = require('../../events');
const { parseChanges } = require('./operations');
const detailedGame = require('../detailedGame');

const joinMsg = 'User api://users/{{competitor.uid}} joined to api://games/{{game.id}} with club api://clubs/{{competitor.club}}';

const tryToReuseGame = async (parent, nameOrId, location) => {
  const availableGame = await db.games.findById(nameOrId);
  if (availableGame && availableGame.status === 'OPEN') {
    await db.games.update({
      ...availableGame,
      parents: R.uniq((availableGame.parents || []).concat(parent.id)),
    });
    return availableGame;
  }
  return db.games.create({ name: nameOrId, location, parents: [parent.id] });
};

const scheduleContinuation = parent => async ({ item: { name, location, competitors } }) => {
  const game = await tryToReuseGame(parent, name, location);
  const events = [systemEvent({ type: 'games' }), systemEvent({ type: 'games', relate: game.id })];
  events.forEach(e => e('api://games/{{id}} was pointed as child of api://games/{{parent}}', game));
  await Promise.all(competitors.map((competitor) => {
    const joinEvent = systemEvent({ type: 'users', relate: competitor.uid });
    return db.competitors.add({ gid: game.id, ...competitor })
      .then(R.tap(() => joinEvent(joinMsg, { competitor, game })));
  }));
  return { [game.id]: competitors.map(R.prop('uid')) };
};

const complete = async (toComplete, continueIn) => {
  const completingGame = toComplete.item;
  const details = await db.games.findById(completingGame.id);
  return db.games.update({
    ...details,
    status: 'COMPLETED',
    continueIn,
  });
};

module.exports = async (changes) => {
  const { toComplete, toCreate } = parseChanges(changes);
  const parent = toComplete.item;
  const created = await Promise.all(toCreate.map(scheduleContinuation(parent)));
  await complete(toComplete, created.reduce(R.merge, {}));
  return detailedGame({ gid: parent.id });
};

