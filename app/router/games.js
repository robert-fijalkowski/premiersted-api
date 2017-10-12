const db = require('../db');
const app = require('express')();
const { games } = require('../services');

app.get('/', async (req, res) => {
  res.json(await games.get(req.query));
});

app.get('/:id', async (req, res) => {
  res.json(await games.get({ id: req.params.id }));
});

app.post('/:id', async (req, res) => {
  const game = await db.games.findById(req.params.id);
  res.json(await games.update({ ...game, ...req.body, ...req.params }));
});

app.delete('/:id', async (req, res) => {
  res.json(await games.delete(req.params));
});

app.post('/:id/competitors', async (req, res) => {
  await games.addCompetitor(req.body);
  res.json(await games.get({ id: req.params.id }));
});
app.post('/', async (req, res) => {
  res.json(await games.create(req.body));
});
module.exports = app;
