const R = require('ramda');
const d = require('talisman/metrics/distance/jaro');

let n = 0;
const distancator = R.curry((a, b) => {
  n++;
  return d(a, b);
});
const fingerprint = require('talisman/keyers/fingerprint');

const qualities = R.pipe(
  R.mapObjIndexed((quality, index) => {
    const qualityScore = parseInt(index, 10);
    return [quality, {
      level: qualityScore,
      percentile: (qualityScore + 1) * 0.01,
      score: R.always({ quality, qualityScore }),
    }];
  }), R.values,
  R.fromPairs,
)(['excellent', 'good', 'average', 'fair', 'poor']);

const percentile = R.curry((nth, set) => {
  const index = R.pipe(
    R.length,
    R.multiply(nth),
    Math.floor,
    R.prop(R.__, set),
  );
  return index(set);
});

const normalizeIndex = R.curry((limit, indexed) => {
  const indexes = R.pluck('index', indexed);
  const [head, last] = R.juxt([R.head, R.last])(indexes);
  const normalize = i => (i - last) / (head - last);
  const [excellent, good, average, fair] =
    [0.00, 0.01, 0.02, 0.03].map(v => normalize(percentile(v, indexes))); // TODO use with qualities percentile
  const quality = R.cond([
    [R.lte(excellent), qualities.excellent.score],
    [R.lte(good), qualities.good.score],
    [R.lte(average), qualities.average.score],
    [R.lte(fair), qualities.fair.score],
    [R.T, qualities.poor.score],
  ]);
  const limitedSet = R.take(limit, indexed);
  return R.map(club => ({
    ...club,
    index: normalize(club.index),
    ...quality(normalize(club.index)),
  }))(limitedSet);
});

module.exports = ({
  search, limit = 10, debug, atLeast = 'average',
}) => {
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
  const atLeastScore = (qualities[atLeast] || atLeast.average).score().qualityScore;
  return R.pipe(
    indexate,
    R.sortBy(R.pipe(R.prop('index'), R.negate)),
    R.pipe(normalizeIndex(limit)),
    R.filter(R.pipe(R.prop('qualityScore'), R.gte(atLeastScore))),
    R.filter(R.pipe(R.prop('index'), R.lte(0.66))),
    R.ifElse(
      R.always(debug), R.identity,
      R.map(R.omit(['index', 'qualityScore'])),
    ),
  );
};
