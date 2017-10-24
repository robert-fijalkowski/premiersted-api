const app = require('express')();

const { users } = require('../services');
const { protectLevel, protect } = require('../utils/jwt');

const onlyAdmin = protectLevel('ADMIN');

app.get('/', protect, (req, res) => {
  res.handle(users.get());
});

app.get('/:id', protect, (req, res) => {
  res.handle(users.get(req.params));
});

app.post('/:id', onlyAdmin, (req, res) => {
  res.handle(users.update({
    body: req.body, id: req.params.id,
  }));
});

module.exports = app;
