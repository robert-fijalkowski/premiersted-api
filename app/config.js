const varium = require('varium');

let overrides;

module.exports = (toOveride = {}) => {
  overrides = {
    ...overrides, ...toOveride,
  };
  return varium({
    ...process.env, ...overrides,
  }, 'env.manifest');
};
