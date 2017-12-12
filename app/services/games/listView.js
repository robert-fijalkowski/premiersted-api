const { competitors } = require('../../db');

const R = require('ramda');
const cachedFind = require('../users/cachedFind');

const fromCompetitorsList = async (game) => {
  const listOfCompetitors = await competitors.find({ gid: game.id });
  const players = await Promise.all(R.pipe(R.pluck('uid'), R.map(id => cachedFind({ id })))(listOfCompetitors));
  return { ...game, players };
};
const fetchUsersFromTable = async (game) => {
  const players = await Promise.all(R.pipe(R.pluck('id'), R.map(id => cachedFind({ id })))(game.table));
  return { ...game, players };
};

module.exports = async (list) => {
  const a = R.cond([
    [R.has('table'), fetchUsersFromTable],
    [R.T, fromCompetitorsList],
  ]);
  return Promise.all(R.map(a, list));
};
