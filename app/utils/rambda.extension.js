const R = require('ramda');

R.mapTo = R.curry((keyFn, valFn, obj) =>
  R.mapObjIndexed(
    R.pipe(R.last, valFn),
    R.groupBy(keyFn, obj),
  ));

R.lostProps = R.curry((required, delivered) => {
  const deliveredProps = R.keys(delivered);
  return R.difference(required, deliveredProps);
});

R.required = R.curry((required, delivered) => R.isEmpty(R.lostProps(required, delivered)));

module.exports = R;
