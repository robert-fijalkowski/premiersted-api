const app = require('express').Router();
const { protectLevel } = require('../../utils/jwt');
const { games } = require('../../services');

app.get(
  '/:cid', protectLevel('USER'),
  (req, res) => res.handle(games.contest(req.params)),
);

module.exports = app;
