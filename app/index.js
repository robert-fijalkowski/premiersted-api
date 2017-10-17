require('./utils/rambda.extension');

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config')();
const github = require('./utils/github');
const cors = require('./utils/cors');


const app = express();
app.use(bodyParser.json());
cors(app);
app.use('/_github', github);
require('./router')(app);

app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
process.on('unhandledRejection', (reason, p) => {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
  // application specific logging here
});
