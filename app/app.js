require('./utils/rambda.extension');

const express = require('express');
const bodyParser = require('body-parser');
const github = require('./utils/github');
const cors = require('./utils/cors');
const { decodeJWT } = require('./utils/jwt');
const timeout = require('connect-timeout'); // express v4
const routing = require('./router');
const exWs = require('express-ws');
const errorHandling = require('./utils/errorHandling');
const hearthbeat = require('./utils/hearthbeat');

module.exports = (middleware) => {
  const app = express();
  if (middleware) {
    app.use(middleware);
  }
  hearthbeat(exWs(app).getWss());
  errorHandling(app);

  app.use(bodyParser.json());
  app.use(decodeJWT);
  cors(app);

  app.use((req, res, next) => {
    if (req.upgrade) {
      return next();
    }
    return timeout('5s')(req, res, next);
  });

  app.use('/_github', github);
  routing(app);
  return app;
};

