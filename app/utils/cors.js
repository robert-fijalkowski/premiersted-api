const cors = require('cors');

module.exports = (app) => {
  app.use(cors({
    origin: ['http://localhost:7000', /http(s)?:\/\/([^.]+\.)*premiersted.schibsted.ga$/],
    allowedHeaders: ['auth-token'],
    preflightContinue: false,
  }));
};
