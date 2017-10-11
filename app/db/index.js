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
  memo[key] = mysql.createConnection({
    ...creds,
  });
  return conn(cfg);
};
module.exports = {
  conn,
  credentials,
  user: require('./modules/user')(conn(config())),
  games: require('./modules/games')(conn(config())),
};
