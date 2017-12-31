const app = require('express')();

const { users } = require('../../services');
const { protectLevel, protect } = require('../../utils/jwt');
const { NotFound, withError } = require('../exceptions');
const { predefined } = require('../../services/events');

const usersEvent = predefined({
  type: 'users',
  relate: ({ req, res }) => req.params.id || res.body.id,
});
const onlyAdmin = protectLevel('ADMIN');
const userExists = async ({ params: { id } }, res, next) => {
  const exists = await users.exists({ id });
  if (exists) {
    return next();
  }
  return res.handle(withError(new NotFound(`User ${id} not exists`)));
};

const ownChangeOrAdmin = (req, res, next) =>
  (req.params.id === req.user.id ? next() : onlyAdmin(req, res, next));

app.get('/', protect, (req, res) => {
  res.handle(users.get());
});
const myProfile = (req, res) => {
  res.handle(users.get(req.user));
};

app.get('/i', protect, myProfile);
app.get('/myProfile', protect, myProfile);

app.get('/:id', protect, userExists, (req, res) => {
  res.handle(users.get(req.params));
});

app.put('/:id', ownChangeOrAdmin, usersEvent('User api://users/{{props.id}} has changed properties'), userExists, (req, res) => {
  res.handle(users.update({
    body: req.body, id: req.params.id,
  }, { right: req.user.access }));
});

module.exports = app;
