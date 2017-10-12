const db = require('../db');
const app = require('express')();

const { users } = require('../services');

app.get('/', async (req, res) => {
  res.json(await users.get());
});

app.get('/:id', async (req, res) => {
  res.json(await users.get(req.params));
});

app.post('/:id', async (req, res) => {
  res.json(await users.update({
    body: req.body, id: req.params.id,
  }));
});

module.exports = app;
