const express = require('express');
const config = require('./config')();
const github = require('./utils/github');

const app = express();


app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
