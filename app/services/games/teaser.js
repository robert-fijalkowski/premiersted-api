const { games } = require('../../db');
const Cache = require('../../utils/cache');

const cache = Cache({ maxAge: 1000 * 60, max: 100 });

module.exports = async id => cache.getOrSet(id, async () => {
  const [game] = await games.teasers([id]);
  return game;
});
