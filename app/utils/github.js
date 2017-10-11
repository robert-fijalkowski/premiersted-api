const passport = require('passport');
const express = require('express');

const config = require('./../config')();
const jwt = require('./jwt');

const app = express();
app.use(passport.initialize());

const GitHubStrategy = require('passport-github').Strategy;
const { user } = require('../db');
const { NotFound } = require('../db/exceptions');

passport.use(new GitHubStrategy({
  clientID: config.get('GITHUB_CLIENT_ID'),
  clientSecret: config.get('GITHUB_SECRET'),
}, async (accessToken, refreshToken, profile, done) => {
  const id = `github:${profile.id}`;
  const { avatar_url, name, email, login } = profile._json; // eslint-disable-line
  const userProfile = {
    id, avatar_url: avatar_url.split('?')[0], name: name || login, login, email, provider: 'github',
  }; // split because JWT is weird

  const data = await user.findById(id);
  if (data) {
    const updated = await user.updateMeta({ id, ...data, ...userProfile });
    done(null, { ...updated });
  } else {
    const inserted = await user.store({ id, ...userProfile });
    done(null, { ...inserted });
  }
}));

app.get('/', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/callback', passport.authenticate('github', {
  failureRedirect: '/login',
  session: false,
}), jwt.auth);

module.exports = app;
