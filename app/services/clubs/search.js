const R = require('ramda');

const distancator = R.curry(require('talisman/metrics/distance/jaro'));
const fingerprint = require('talisman/keyers/fingerprint');

const memo = R.memoizeWith((a, b) => a + b, (a, b) => distancator(a, b));
const dct = a => b => memo(a, b);

const synthetizeWords = R.pipe(R.map(R.pipe(
  R.toLower,
  n => [n, n.replace('ch', 'cz'), n.replace('sea', 'si'), n.replace('sea', 'si').replace('ch', 'cz')],
  R.map(n => [n, n.replace(/ /g, '')]),
  R.flatten, R.uniq,
)), R.flatten);

const qualities = R.pipe(
  R.mapObjIndexed((quality, index, whole) => {
    const qualityScore = parseInt(index, 10);
    const isLast = parseInt(index, 10) === (whole.length - 1);
    return [quality, {
      level: qualityScore,
      cond: [isLast ? R.T : R.lte(1 - (index * 0.1)), R.always({ quality, qualityScore })],
    }];
  }), R.values,
  R.fromPairs,
)(['excellent', 'good', 'average', 'fair', 'poor']);

const scoreIndex = R.curry((limit, maxSize, indexed) => {
  const quality = R.cond(R.pluck('cond', R.values(qualities)));
  const limitedSet = R.take(limit, indexed);
  return R.map(club => ({
    ...club,
    index: (club.index / maxSize),
    ...quality(club.index / maxSize),
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
    R.uniq,
  )(search);
  const matchers = R.map(dct)(conditions);
  const distance = R.map(R.pipe(
    R.split(' '), R.filter(R.pipe(R.length, R.lte(3))), R.map(fingerprint),
    R.uniq,
    R.xprod(matchers, R.__),
    R.pipe(R.map(([c, a]) => c(a))),
  ));
  const sortNumbersDesc = R.sortWith([R.descend(R.identity)]);
  const subIndex = R.pipe(
    R.filter(R.lte(0.66)),
    sortNumbersDesc, R.take(rawConfidtionsCount),
    R.append(0),
  );
  const buildIndex = R.pipe(
    R.values,
    R.map(subIndex),
    R.flatten, subIndex, R.sum,
  );
  const indexate = R.map(o => ({
    ...o,
    index: R.pipe(
      R.pickAll(['name', 'division', 'keywords']),
      ({ name, division, keywords }) =>
        ([...synthetizeWords([...keywords, name, division])]),
      R.pipe(distance, buildIndex),
    )(o),
  }));
  const atLeastScore = (qualities[atLeast] || atLeast.average).level;
  return R.pipe(
    indexate,
    R.sortWith([
      R.descend(R.prop('index')),
      R.descend(R.prop('score')),
      R.ascend(R.pipe(R.prop('name'), R.length)),
    ]),
    R.pipe(scoreIndex(limit, rawConfidtionsCount)),
    R.filter(R.pipe(R.prop('qualityScore'), R.gte(atLeastScore))),
    R.ifElse(
      R.always(debug), R.identity,
      R.pipe(
        R.filter(R.pipe(R.prop('index'), R.lt(0))),
        R.map(R.omit(['index', 'qualityScore'])),
      ),
    ),
  );
};
