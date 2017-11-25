const app = require('express')();
const { clubs } = require('../../services');
const R = require('ramda');
const { BadRequest, error } = require('../exceptions');

app.get(
  '/',
  (req, res) => {
    res.handle(clubs.get(req.query));
  },
);

app.get('/:type', (req, res, next) => {
  const { type } = req.params;
  if (Number.isNaN(parseInt(type, 10))) {
    const list = clubs.listOf({ type });
    return !R.isEmpty(list)
      ? res.handle(list)
      : error(new BadRequest(`Invalid request type ${type}`));
  }
  return next();
});


app.get('/:id', (req, res) => {
  res.handle(clubs.get({ id: req.params.id }));
});
module.exports = app;
