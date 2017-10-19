const app = require('express')();
const { games } = require('../services');
const R = require('ramda');
const { BadRequest, NotFound, error } = require('./exceptions');
const { protectLevel } = require('../utils/jwt');

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

app.get('/:id', gameExists, (req, res) => {
  res.handle(() => games.get({ id: req.params.id }));
});

app.post('/:id', onlyAdmin, gameExists, async (req, res) => {
  const game = await games.get(req.params);
  res.handle(await games.update({
    ...game,
    ...req.body,
    ...req.params,
    status: game.status,
    id: game.id,
  }));
});

app.delete('/:id', onlyAdmin, gameExists, (req, res) => {
  res.handle(games.delete(req.params));
});

app.post('/:id/competitors', gameExists, ({ body, params: { id } }, res) => {
  const lostProps = R.lostProps(['uid', 'club'], body);
  if (!R.isEmpty(lostProps)) {
    throw new BadRequest(`missing props: ${lostProps.join(',')}`);
  }
  res.handle(games.addCompetitor(id, body), () => res.redirect(`../${id}`));
});

app.get('/:id/schedule', onlyAdmin, gameExists, (req, res) => {
  res.handle(games.prepareSchedule({ gid: req.params.id }));
});

app.post('/', onlyAdmin, (req, res) => {
  res.handle(games.create(req.body));
});
module.exports = app;
