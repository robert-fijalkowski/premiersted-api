const app = require('express')();

const { accounts } = require('../../services');

app.get('/', (req, res) => {
  res.handle(accounts.findAll(req.user.id));
});

module.exports = app;
