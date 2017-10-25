const { games, competitors, contests } = require('../../db');
const R = require('ramda');

const zeroFillObj = (...values) => R.reduce((acc, v) => ({ ...acc, [v]: 0 }), [], values);
const resultEvolve = R.evolve({
  result: r => ({
    ...r,
    status: R.cond([
      [({ visitor, home }) => visitor > home, R.always('visitor')],
      [({ visitor, home }) => visitor < home, R.always('home')],
      [R.T, R.always('draw')],
    ])(r),
  }),
});

const resultFor = R.curry((uid, m) => {
  const resultStatus = R.path(['result', 'status'], m);
  if (resultStatus === 'draw') {
    return 'draw';
  }
  return m[resultStatus] === uid ? 'win' : 'lose';
});

const asWin = ({ result: { visitor, home } }) => ({
  played: 1,
  points: 3,
  wins: 1,
  scored: R.max(visitor, home),
  lost: R.min(visitor, home),
  balance: Math.abs(visitor - home),
});
const asDraw = ({ result: { visitor } }) => ({
  played: 1,
  points: 1,
  draws: 1,
  scored: visitor,
  lost: visitor,
});

const asLose = ({ result: { visitor, home } }) => ({
  played: 1,
  loses: 1,
  scored: R.min(visitor, home),
  balance: -Math.abs(visitor - home),
  lost: R.max(visitor, home),
});
const initialRow = zeroFillObj('points', 'wins', 'draws', 'loses', 'played', 'scored', 'lost', 'balance');
const mergeTablePartials =
R.mergeWithKey((k, l, r) => R.cond([
  [R.equals('id'), R.always(l)],
  [R.T, R.always(l + r)],
])(k));
module.exports = {
  async getTable({ gid }) {
    const [matches, players] = await Promise.all([
      contests.find({ gid })
        .then(R.filter(R.complement(R.propEq('status', 'SCHEDULED'))))
        .then(R.map(R.pickAll(['home', 'visitor', 'result'])))
        .then(R.map(resultEvolve)),
      competitors.find({ gid })]);
    const initialTable = id => ({
      id,
      ...initialRow,
    });

    const matchesIndexed = R.mergeDeepWith(
      R.concat,
      R.groupBy(R.prop('visitor'), matches),
      R.groupBy(R.prop('home'), matches),
    );
    const table = R.mapObjIndexed(
      (relatedMatches, player) => R.reduce((acc, match) => {
        const partial = R.cond([
          [R.equals('win'), R.always(asWin(match))],
          [R.equals('lose'), R.always(asLose(match))],
          [R.equals('draw'), R.always(asDraw(match))],
        ])(resultFor(player, match));
        return mergeTablePartials(acc, partial);
      }, initialTable(player), relatedMatches),
      matchesIndexed,
    );
    const emptyTable = R.mapTo(R.prop('uid'), ({ uid }) => initialTable(uid))(players);
    const theTable = R.mergeWith(mergeTablePartials, emptyTable, table);

    const sortedTable = R.sortWith([
      R.descend(R.prop('points')),
      R.ascend(R.prop('played')),
      R.descend(R.prop('wins')),
      R.descend(R.prop('balance')),
    ], R.values(theTable));

    return R.scan((previous, next) => {
      if (R.equals(previous, [])) {
        return { ...next, position: 1 };
      }
      const onlySortableKeys = R.pickAll(['points', 'played', 'wins', 'balance']);
      const position = R.cond([
        [R.equals(onlySortableKeys(next)), R.always(previous.position + 1)],
        [R.T, R.always(previous.position + 1)],
      ])(onlySortableKeys(previous));
      return { ...next, position };
    })([], sortedTable).slice(1);
  },
  async updateTable({ gid }) {
    const [game, table] = await Promise.all([
      games.findById(gid),
      this.getTable({ gid }),
    ]);
    games.update({ ...game, table });
  },
};
