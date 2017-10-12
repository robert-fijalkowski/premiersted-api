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

const useAllKeysToFilter = (query) => {
  const keys = R.keys(query);
  const lowerCased = R.pipe(R.toString, R.toLower);
  const comparator = name => R.ifElse(
    R.is(String),
    R.pipe(lowerCased, R.contains(R.prop(name, query).toString().toLocaleLowerCase())),
    R.equals(parseFloat(R.prop(name, query))),
  );
  const foundPartials = name => R.pipe(
    R.prop(name),
    comparator(name),
  );
  const filters = R.map(name => R.filter(foundPartials(name)))(keys);
  return filters.reduce((acc, next) => R.pipe(acc, next), R.filter(R.T));
};
const nConditions = n => R.pipe(R.values, R.length, R.equals(n));
module.exports = {
  get(query) {
    const filterData = R.cond([
      [R.both(R.prop('id'), nConditions(1)), ({ id }) => R.pipe(R.filter(R.propEq('id', id)), R.head)],
      [R.complement(R.isEmpty), useAllKeysToFilter],
      [R.T, () => R.identity()],
    ])(query);
    return filterData(data);
  },
  data,
};
