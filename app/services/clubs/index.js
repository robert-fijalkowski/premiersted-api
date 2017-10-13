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
const fingerprint = require('talisman/keyers/fingerprint');

const percentile = R.curry((nth, set) => {
  const index = R.pipe(
    R.length,
    R.multiply(nth),
    Math.floor,
    R.prop(R.__, set),
  );
  return index(set);
});
const searchBy = ({ search, limit = 10, debug }) => {
  const rawConfidtionsCount = search.split(',').length;
  const conditions = R.pipe(
    R.split(','),
    R.map(q => [q, q.replace(/ /g, '')]),
    R.flatten,
    R.map(fingerprint),
  )(search);
  const matchers = R.map(distancator)(conditions);
  const sortNumbersDesc = R.sortWith([R.descend(R.identity)]);
  const distance = R.map(R.pipe(
    R.split(' '), R.filter(R.pipe(R.length, R.lte(3))), R.map(fingerprint),
    R.xprod(matchers, R.__),
    R.pipe(R.map(([c, a]) => c(a))),
  ));
  const subIndex = R.pipe(sortNumbersDesc, R.take(rawConfidtionsCount), R.sum);
  const buildIndex = R.pipe(
    R.values,
    R.map(subIndex),
    R.flatten, subIndex,
  );
  const indexate = R.map(o => ({
    ...o,
    index: R.pipe(
      R.pickAll(['name', 'division']),
      ({ name, division }) => ([name, name.replace(/ /g, ''), division.replace(/ /g, '')]),
      R.pipe(distance, buildIndex),
    )(o),
  }));
  return R.pipe(
    indexate,
    R.sortBy(R.pipe(R.prop('index'), R.negate)),
    R.pipe((indexed) => {
      const indexes = R.pluck('index', indexed);
      const [head, last] = [R.head, R.last].map(a => a(indexes));
      const normalize = i => (i - last) / (head - last);
      const [excellent, good, average, fair, poor] =
        [0.00, 0.01, 0.02, 0.03, 0.1]
          .map(v => normalize(percentile(v, indexes)));
      return R.map(club => ({
        ...club,
        index: normalize(club.index),
        ...R.cond([
          [R.lte(excellent), R.always({ quality: 'excellent' })],
          [R.lte(good), R.always({ quality: 'good' })],
          [R.lte(average), R.always({ quality: 'average' })],
          [R.lte(fair), R.always({ quality: 'fair' })],
          [R.lte(poor), R.always({ quality: 'poor' })],
        ])(normalize(club.index)),
      }))(R.take(limit, indexed));
    }),
    R.ifElse(
      R.always(debug), R.identity,
      R.pipe(
        R.filter(R.pipe(R.prop('index'), R.lte(0.75))),
        R.map(R.omit(['index'])),
      ),
    ),
  );
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
