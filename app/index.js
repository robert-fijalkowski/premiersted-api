const express = require('express');
const config = require('./config')();
const github = require('./utils/github');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use('/_github', github);
require('./router')(app);

app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
process.on('unhandledRejection', (reason, p) => {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
  // application specific logging here
});
