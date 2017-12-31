const app = require('express')();

const { jwt } = require('../../services');

app.put('/exchange', (req, res) => {
  res.handle(jwt.exchange(req.user));
});

module.exports = app;

