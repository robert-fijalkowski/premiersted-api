const LRU = require('lru-cache');

module.exports = (options) => {
  const cache = LRU(options);

  cache.getOrSet = async (key, dataP) => {
    let val = cache.get(key);
    if (!val) {
      val = await dataP(key);
      cache.set(key, val);
    }
    return val;
  };
  return cache;
};
