/* eslint-disable global-require */

module.exports = (app) => {
  app.use('/users', require('./users'));
  app.use('/games', require('./games'));
};

