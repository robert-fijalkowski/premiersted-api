const { users } = require('../../db');
const Cache = require('../../utils/cache');

const cache = Cache({ maxAge: 1000 * 60, max: 100 });

module.exports = async ({ id }) =>
  cache.getOrSet(id, async () => {
    const { meta: { avatar_url, name } } = await users.findById(id, ['users']);
    return { id, name, avatar_url };
  });
