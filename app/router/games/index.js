const app = require('express').Router();

app.use('/', require('./games'));
app.use('/', require('./results'));

module.exports = app;
