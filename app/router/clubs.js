const app = require('express')();
const { clubs } = require('../services');

app.get('/', async (req, res) => {
  res.json(await clubs.get(req.query));
});
app.get('/:id', async (req, res) => {
  res.json(await clubs.get({ id: req.params.id }));
});
module.exports = app;
