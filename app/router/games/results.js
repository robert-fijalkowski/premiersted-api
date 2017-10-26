const app = require('express').Router();
const { games } = require('../../services');

const { gameExists, myContestOrAdmin } = require('./rights');

app.post(
  '/:id/schedule/:cid', myContestOrAdmin, gameExists,
  (req, res) => {
    const { cid, id } = req.params;
    res.handle(games.postResult({
      id: cid, gid: id, ...req.body, reportedBy: req.user.id,
    }));
  },
);

app.put(
  '/:id/schedule/:cid', myContestOrAdmin, gameExists,
  (req, res) => {
    const { cid, id } = req.params;
    res.handle(games.postResult({
      id: cid, gid: id, ...req.body, force: true, editedBy: req.user.id,
    }));
  },
);

module.exports = app;
