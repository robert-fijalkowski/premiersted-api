const passport = require('passport');
const express = require('express');

const config = require('./../config')();
const jwt = require('./jwt');

const app = express();
app.use(passport.initialize());

const GitHubStrategy = require('passport-github').Strategy;
const { user } = require('../db');

passport.use(new GitHubStrategy({
  clientID: config.get('GITHUB_CLIENT_ID'),
  clientSecret: config.get('GITHUB_SECRET'),
}, (accessToken, refreshToken, profile, done) => {
  const id = `github:${profile.id}`;
  const { avatar_url, name, email, login } = profile._json; // eslint-disable-line
  const userProfile = {
    id, avatar_url: avatar_url.split('?')[0], name: name || login, login, email, provider: 'github',
  }; // split because JWT is weird
  user.findById(id).then(() => {
    user.store(userProfile).then(() => {
      done(null, { ...userProfile, state: 'existing' });
    });
  })
    .catch((e) => {
      if (e instanceof NotFound) {
        user.storeById(id, userProfile).then(() => {
          done(null, { ...userProfile, state: 'new' });
        });
      } else {
        done(e, null);
      }
    });
}));

app.get('/', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/callback', passport.authenticate('github', {
  failureRedirect: '/login',
  session: false,
}), jwt.auth);

module.exports = app;
