const app = require('express')();
const { games } = require('../services');
const { NotFound, error } = require('./exceptions');
const { protectLevel } = require('../utils/jwt');
const { requiredProps } = require('./helper');

const onlyAdmin = protectLevel('ADMIN');

const gameExists = async (req, res, next) => {
  const { id } = req.params;
  const exists = await games.exists(req.params.id);
  if (exists) { return next(); }
  return res.handle(() => error(new NotFound(`Game ${id} does not exists`)));
};

app.get('/', async (req, res) => {
  res.handle(await games.get(req.query));
});

app.get(
  '/:id', gameExists,
  (req, res) => {
    res.handle(() => games.get({ id: req.params.id }));
  },
);

app.post(
  '/:id', onlyAdmin, gameExists,
  async (req, res) => {
    const game = await games.get(req.params);
    res.handle(await games.update({
      ...game,
      ...req.body,
      ...req.params,
      status: game.status,
      id: game.id,
    }));
  },
);

app.delete(
  '/:id', onlyAdmin, gameExists,
  (req, res) => {
    console.log(`Deleting a game ${req.params.id} by ${req.user.id}`);
    res.handle(games.delete(req.params));
  },
);

app.post(
  '/:id/competitors', requiredProps('uid', 'club'), gameExists,
  ({ body, params: { id } }, res) => {
    res.handle(games.addCompetitor(id, body));
  },
);


app.delete(
  '/:id/competitors', requiredProps('uid'), gameExists,
  ({ body, params: { id } }, res) => {
    res.handle(games.delCompetitor(id, body));
  },
);

app.get(
  '/:id/schedule', onlyAdmin, gameExists,
  (req, res) => {
    res.handle(games.prepareSchedule({ gid: req.params.id }));
  },
);

app.post(
  '/', requiredProps('name', 'location'), onlyAdmin,
  (req, res) => {
    res.handle(games.create(req.body));
  },
);
module.exports = app;
