require('./utils/rambda.extension');

const express = require('express');
const bodyParser = require('body-parser');
const github = require('./utils/github');
const cors = require('./utils/cors');
const { decodeJWT } = require('./utils/jwt');
const timeout = require('connect-timeout'); // express v4


const app = express();

require('express-ws')(app);
require('./utils/errorHandling')(app);

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
require('./router')(app);

module.exports = app;
