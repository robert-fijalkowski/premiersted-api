/* eslint-disable global-require */
const mysql = require('mysql2/promise');

const memo = {};
const config = require('../config');

const credentials = cfg => ({
  host: cfg.get('MYSQL_HOST'),
  user: cfg.get('MYSQL_USER'),
  password: cfg.get('MYSQL_PASSWORD'),
  database: cfg.get('MYSQL_DB'),
});

const conn = async (cfg) => {
  const creds = credentials(cfg);
  const key = JSON.stringify(creds);
  if (memo[key]) {
    return memo[key];
  }
  memo[key] = mysql.createPool({
    ...creds,
    namedPlaceholders: true,
  });
  memo[key].query("SET time_zone = 'Europe/Warsaw'");
  memo[key].on('end', () => { memo[key] = null; });
  return conn(cfg);
};
module.exports = {
  conn,
  credentials,
  users: require('./modules/users')(conn(config())),
  games: require('./modules/games')(conn(config())),
  competitors: require('./modules/competitors')(conn(config())),
  contests: require('./modules/contests')(conn(config())),
};
