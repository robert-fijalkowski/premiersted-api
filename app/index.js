require('./utils/rambda.extension');

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config')();
const github = require('./utils/github');
const cors = require('./utils/cors');
const timeout = require('connect-timeout'); // express v4


const app = express();
require('./utils/errorHandling')(app);

app.use(bodyParser.json());
cors(app);

app.use(timeout('5s'));

app.use('/_github', github);
require('./router')(app);

app.use((req, res, next) => {
  if (!req.timedout) next();
});

app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
