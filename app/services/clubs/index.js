const data = require('./clubs.json');

const R = require('ramda');

module.exports = {
  get(q) {
    const useAllKeysToFilter = (fields) => {
      const keys = R.keys(fields);
      const foundPartials = name => R.pipe(R.prop(name), R.toString, R.toLower, R.contains(R.prop(name, fields).toString().toLocaleLowerCase()));
      const filters = R.map(name => R.filter(foundPartials(name)))(keys);
      return filters.reduce((acc, next) => R.pipe(acc, next), R.filter(R.T));
    };

    const r = R.cond([
      [R.prop('id'), ({ id }) => R.pipe(R.filter(R.propEq('id', id)), R.head)],
      [R.complement(R.isEmpty), useAllKeysToFilter],
      [R.T, () => R.identity()],
    ])(q);
    return r(data);
  },
};
