const express = require('express');
const config = require('./config')();
const github = require('./utils/github');
const db = require('./db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.use('/_github', github);
app.get('/users', async (req, res) => {
  const users = await db.user.getAll();
  res.json(users);
});

app.post('/users/:id', async (req, res) => {
  await Promise.all([
    db.user.updateMeta({ ...req.body, id: req.params.id }),
    db.user.setAccess({ ...req.body, id: req.params.id }),
  ]);
  const user = await db.user.findById(req.params.id);
  res.json(user);
});

app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
