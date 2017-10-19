/* eslint-disable global-require */

const { protect } = require('../utils/jwt');

module.exports = (app) => {
  app.use(require('./handle'));
  app.use('/users', protect, require('./users'));
  app.use('/games', protect, require('./games'));
  app.use('/clubs', require('./clubs'));
  app.use(require('./error'));
};

