const R = require('ramda');
const randomatic = require('randomatic');

const decodeGame = game => ({ ...game, meta: undefined, ...JSON.parse(game.meta) });

module.exports = dbP => ({
  async create({ name, location, ...meta }) {
    const db = await dbP;
    const id = randomatic('Aa0', 5);
    await db.execute(
      'INSERT INTO games(id, name, location, status, meta) values (?,?,?,?,?)',
      [id, name, location, 'OPEN', JSON.stringify(meta)],
    );
    return this.findById(id);
  },
  async findById(id) {
    const db = await dbP;
    const [[game]] = await db.execute('SELECT * FROM games WHERE id = ?', [id]);
    if (!game) {
      return null;
    }
    return decodeGame(game);
  },
  async findBy(by) {
    const db = await dbP;
    const genericFind = field => value => db.execute('SELECT * FROM games WHERE ? LIKE "%?%"', [field, value])
      .then(R.prop(0));
    const results = await Promise.all(R.pipe(
      R.pickAll(['name', 'location']),
      R.filter(R.complement(R.isNil)),
      R.mapObjIndexed((value, key) => genericFind(key)(value)),
      R.values,
    )(by));
    return R.pipe(R.reduce(R.concat, []), R.uniqBy(R.prop('id')), R.map(decodeGame))(results);
  },
  async update({
    id, name, status, location, ...meta
  }) {
    const db = await dbP;
    db.execute(
      'UPDATE games SET name=?, status=?, location=?, meta=? WHERE id = ?',
      [name, status, location, JSON.stringify(meta), id],
    );
  },
  async migrate() {
    const db = await dbP;
    return db.execute("CREATE TABLE `games` ( `id` VARCHAR(32) NOT NULL , `name` VARCHAR(64) NOT NULL , `location` VARCHAR(64) NOT NULL , `status` ENUM('OPEN','ONGOING','EXPIRED','CANCELLED') NOT NULL , `meta` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
  },
  async drop() {
    const db = await dbP;
    return db.execute('DROP TABLE `games`');
  },
});

