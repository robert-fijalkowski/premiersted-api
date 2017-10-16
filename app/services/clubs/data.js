const rawData = require('./clubs.json');
const R = require('ramda');

const star = R.cond([
  [R.gte(59), R.always(0.5)],
  [R.gte(62), R.always(1)],
  [R.gte(64), R.always(1.5)],
  [R.gte(66), R.always(2)],
  [R.gte(68), R.always(2.5)],
  [R.gte(70), R.always(3)],
  [R.gte(74), R.always(3.5)],
  [R.gte(78), R.always(4)],
  [R.gte(82), R.always(4.5)],
  [R.T, R.always(5)],
]);
const addStars = R.map(o => ({
  ...o,
  stars: star(o.score),
}));
const data = addStars(rawData);
const basicProps = R.keys(data[0]);

module.exports = { data, basicProps, rawData }
;