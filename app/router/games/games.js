const app = require('express').Router();
const { games } = require('../../services');
const { requiredProps } = require('../helper');

const { onlyAdmin, gameExists, myRequestOrAdmin } = require('./rights');

app.get('/', async (req, res) => {
  res.handle(await games.get(req.query));
});

const { predefined } = require('../../services/events');

const gameEvent = predefined({
  type: 'games',
  relate: ({ req, res }) => req.params.id || res.body.id,
});
const competitorEvent = predefined({ type: 'users', relate: ({ req }) => req.body.uid });
const gamesBroadcast = predefined({ type: 'games' });

app.get('/:id', gameExists, (req, res) => {
  res.handle(() => games.get({ gid: req.params.id }));
});

app.put(
  '/:id',
  onlyAdmin,
  gameExists,
  gameEvent('Game api://games/{{props.id}} has been modified'),
  async (req, res) => {
    res.handle(await games.update(req.params.id, req.body));
  },
);
const deleted = 'Game api://games/{{props.id}} has been cancelled';
app.delete('/:id', onlyAdmin, gameExists, gameEvent(deleted), gamesBroadcast(deleted), (req, res) =>
  res.handle(games.complete(req.params)));

const join =
  'User api://users/{{props.uid}} joined to game api://games/{{body.id}} with club api://clubs/{{props.club}}';

app.post(
  '/:id/competitors',
  requiredProps('uid', 'club'),
  gameExists,
  competitorEvent(join),
  gameEvent(join),
  ({ body, params: { id } }, res) => {
    res.handle(games.addCompetitor(id, body));
  },
);

app.delete(
  '/:id/competitors',
  requiredProps('uid'),
  gameEvent('User api://users/{{props.uid}} left api://games/{{props.id}}'),
  competitorEvent('User api://users/{{props.uid}} left api://games/{{props.id}}'),
  gameExists,
  myRequestOrAdmin,
  ({ body, params: { id } }, res) => {
    res.handle(games.delCompetitor(id, body));
  },
);

app.get('/:id/schedule', onlyAdmin, gameExists, (req, res) => {
  res.handle(games.prepareSchedule({ gid: req.params.id }));
});

const started = 'Game api://games/{{props.id}} has been started';

app.post(
  '/:id/schedule',
  onlyAdmin,
  gameExists,
  gameEvent(started),
  gamesBroadcast(started),
  (req, res) => res.handle(games.makeSchedule({ gid: req.params.id })),
);

const completed = 'Game api://games/{{props.id}} has been completed';

app.post(
  '/:id/complete',
  onlyAdmin,
  gameExists,
  gameEvent(completed),
  gamesBroadcast(completed),
  (req, res) => res.handle(games.complete.exec({ ...req.body, gid: req.params.id })),
);

app.get('/:id/complete', onlyAdmin, gameExists, (req, res) =>
  res.handle(games.complete.scan({ ...req.body, gid: req.params.id })));

const expired = 'Game api://games/{{props.id}} has been marked as expired/abandoned';

app.post(
  '/:id/expire',
  onlyAdmin,
  gameExists,
  gameEvent(expired),
  gamesBroadcast(expired),
  (req, res) => res.handle(games.expireGame({ gid: req.params.id })),
);

app.get('/:id/table', gameExists, (req, res) => {
  const { id } = req.params;
  res.handle(games.getTable({ gid: id }));
});

app.post(
  '/:id/table',
  onlyAdmin,
  gameExists,
  gameEvent('Table of api://games/{{props.id}} has been refreshed manually'),
  (req, res) => {
    const { id } = req.params;
    res.handle(games.updateTable({ gid: id }));
  },
);

const created = 'Game created api://games/{{body.id}}';

app.post(
  '/',
  requiredProps('name', 'location'),
  onlyAdmin,
  gameEvent(created),
  gamesBroadcast(created),
  (req, res) => {
    res.handle(games.create(req.body));
  },
);

module.exports = app;
