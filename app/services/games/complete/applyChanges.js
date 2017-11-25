const db = require('../../../db');
const R = require('ramda');
const { systemEvent } = require('../../events');
const { parseChanges } = require('./operations');
const detailedGame = require('../detailedGame');

const joinMsg = 'User api://users/{{competitor.uid}} joined to api://games/{{game.id}} with club api://clubs/{{competitor.club}}';
const create = parent => async ({ item: { name, location, competitors } }) => {
  const game = await db.games.create({ name, location, parent: parent.id });
  const events = [systemEvent({ type: 'games' }), systemEvent({ type: 'games', relate: game.id })];
  events.forEach(e => e('api://games/{{id}} was created as child of api://games/{{parent}}', game));
  await Promise.all(competitors.map((competitor) => {
    const joinEvent = systemEvent({ type: 'users', relate: competitor.uid });
    return db.competitors.add({ gid: game.id, ...competitor })
      .then(R.tap(() => joinEvent(joinMsg, { competitor, game })));
  }));
  return { [game.id]: competitors.map(R.prop('uid')) };
};

const complete = async (toComplete, continueIn) => {
  const parent = toComplete.item;
  const parentGame = await db.games.findById(parent.id);
  return db.games.update({
    ...parentGame,
    status: 'COMPLETED',
    continueIn,
  });
};

module.exports = async (changes) => {
  const { toComplete, toCreate } = parseChanges(changes);
  const parent = toComplete.item;
  const created = await Promise.all(toCreate.map(create(parent)));
  await complete(toComplete, created.reduce(R.merge, {}));
  return detailedGame({ gid: parent.id });
};

