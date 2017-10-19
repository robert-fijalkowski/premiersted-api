const app = require('express')();

const { users } = require('../services');
const { protectLevel } = require('../utils/jwt');

const onlyAdmin = protectLevel('ADMIN');

app.get('/', (req, res) => {
  res.handle(users.get());
});

app.get('/:id', (req, res) => {
  res.handle(users.get(req.params));
});

app.post('/:id', onlyAdmin, (req, res) => {
  res.handle(users.update({
    body: req.body, id: req.params.id,
  }));
});

module.exports = app;
