const R = require('ramda');

const { basicProps, data } = require('./data');

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

const searchBy = require('./search');

const nConditions = n => R.pipe(R.values, R.length, R.equals(n));

module.exports = {
  get(query = {}, dataSet = data) {
    const filterData = R.cond([
      [R.both(R.prop('id'), nConditions(1)), ({ id }) => R.pipe(R.filter(R.propEq('id', id)), R.head)],
      [R.prop('search'), searchBy],
      [R.complement(R.isEmpty), useAllKeysToFilter],
      [R.T, () => R.identity()],
    ])(query);
    const results = filterData(dataSet);
    return R.ifElse(
      R.is(Array),
      R.map(R.omit(['keywords'])),
      R.omit(['keywords']),
    )(results);
  },
  listOf({ type }, dataSet = data) {
    const allowedQueries = ['country', 'division'];
    const prop = R.head(R.intersection(R.of(type), allowedQueries));
    return R.pipe(
      R.pluck(prop),
      R.uniq, R.filter(R.complement(R.isNil)),
      R.sortWith([R.ascend(R.identity)]),
    )(dataSet);
  },
};
