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

const useAllKeysToFilter = (query) => {
  const keys = R.intersection(R.keys(query), basicProps);
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

const distancator = R.curry(require('talisman/metrics/distance/jaro'));

const searchBy = ({ search, limit = 10, debug }) => {
  const conditions = search.split(',').map(R.pipe(R.trim, R.replace(/ /g, ''), R.toLower));
  const matchers = R.map(distancator)(conditions);
  const sortNumbersAsc = R.sortWith([R.ascend(R.identity)]);
  const distance = R.map(R.pipe(
    R.split(' '), R.filter(f => f.length >= 3), R.join(' '), R.toLower, R.of,
    R.xprod(matchers, R.__),
    R.pipe(R.map(([c, a]) => c(a))),
  ));
  const buildIndex = R.pipe(R.values, R.flatten, sortNumbersAsc, R.reduce(R.max, []));
  const h = R.map(o => ({
    ...o,
    index: R.pipe(
      R.pickAll(['name', 'division']),
      R.pipe(distance, buildIndex),
    )(o),
  }));
  const q = R.pipe(
    h,
    R.sortBy(R.pipe(R.prop('index'), R.negate)),
    R.take(limit),
    R.filter(R.pipe(R.prop('index'), R.lte(0.75))),
    R.ifElse(R.always(debug), R.identity, R.map(R.omit(['index']))),
  );
  return q;
};

const nConditions = n => R.pipe(R.values, R.length, R.equals(n));

module.exports = {
  get(query = {}, dataSet = data) {
    const filterData = R.cond([
      [R.both(R.prop('id'), nConditions(1)), ({ id }) => R.pipe(R.filter(R.propEq('id', id)), R.head)],
      [R.prop('search'), searchBy],
      [R.complement(R.isEmpty), useAllKeysToFilter],
      [R.T, () => R.identity()],
    ])(query);
    return filterData(dataSet);
  },
  data,
};
