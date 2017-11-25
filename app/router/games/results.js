const app = require('express').Router();
const R = require('ramda');
const { games } = require('../../services');
const { gameExists, myContestOrAdmin, isContestInGame } = require('./rights');
const { predefined, mergeEvents } = require('../../services/events');

const contestEvent = predefined({ type: 'contests', relate: (({ req }) => req.params.cid) });
const gameEvent = predefined({ type: 'games', relate: (({ req }) => req.params.id) });
const userEvents = (tpl) => {
  const userEvent = ['home', 'visitor']
    .map(ha => predefined({ type: 'users', relate: (({ req }) => req.contest[ha]) }));
  return (req, res, next) => {
    userEvent.forEach(event => event(tpl)(req, res, R.T));
    next();
  };
};
const events = mergeEvents(contestEvent, gameEvent, userEvents);

app.get(
  '/:id/schedule/:cid', isContestInGame, gameExists,
  (req, res) => {
    res.handle(games.contest(req.params));
  },
);

app.post(
  '/:id/schedule/:cid', isContestInGame, myContestOrAdmin, gameExists,
  events('Result of api://contests/{{props.cid}} in api://games/{{props.id}} has been posted!'),
  (req, res) => {
    const { cid, id } = req.params;
    res.handle(games.postResult({
      id: cid, gid: id, ...req.body, reportedBy: req.user.id,
    }));
  },
);

app.put(
  '/:id/schedule/:cid', isContestInGame, myContestOrAdmin, gameExists,
  events('api://contests/{{props.cid}} in api://games/{{props.id}} has been updated!'),
  (req, res) => {
    const { cid, id } = req.params;
    res.handle(games.editResult({
      id: cid, gid: id, ...req.body, force: true, editedBy: req.user.id,
    }));
  },
);
app.delete(
  '/:id/schedule/:cid', isContestInGame, myContestOrAdmin, gameExists,
  events('api://contests/{{props.cid}} in api://games/{{props.id}} has been rejected!'),
  (req, res) => {
    const { cid, id } = req.params;
    res.handle(games.rejectResult({ id: cid, gid: id }));
  },
);

module.exports = app;
