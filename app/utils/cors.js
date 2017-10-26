const cors = require('cors');

module.exports = (app) => {
  app.use(cors({
    origin: [/^http(s)?:\/\/localhost/, /http(s)?:\/\/([^.]+\.)*premiersted.schibsted.ga$/],
    allowedHeaders: ['auth-token'],
    preflightContinue: false,
  }));
};
