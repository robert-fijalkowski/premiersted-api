const R = require('ramda');

R.mapTo = R.curry((keyFn, valFn, obj) => R.mapObjIndexed(R.pipe(R.last, valFn), R.groupBy(keyFn, obj)));
