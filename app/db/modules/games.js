const R = require('ramda');
const randomatic = require('randomatic');

const decodeGame = game => ({
  ...game, meta: undefined, ...JSON.parse(game.meta),
});

module.exports = dbP => ({
  async create({
    name, id, location, ...meta
  }) {
    const db = await dbP;
    const newId = randomatic('Aa0', 5);
    await db.query(
      'INSERT INTO games(id, name, location, status, meta) values (?,?,?,?,?)',
      [newId, name, location, 'OPEN', JSON.stringify({
        ...meta, created: new Date().toUTCString(),
      })],
    );
    return this.findById(newId);
  },
  async teasers(ids) {
    const db = await dbP;
    const games = await Promise.all(ids.map(id => db.query('SELECT name,status,location FROM games WHERE id =?', [id]).then(R.prop(0))));
    return R.reduce(R.concat, [], games);
  },
  async findById(id) {
    const db = await dbP;
    const [[game]] = await db.query('SELECT * FROM games WHERE id = ?', [id]);
    if (!game) {
      return false;
    }
    return decodeGame(game);
  },
  async getAll() {
    const db = await dbP;
    const [games] = await db.query('SELECT * FROM games');
    return R.pipe(R.map(decodeGame))(games);
  },
  async delete(id) {
    const db = await dbP;
    await db.query('DELETE FROM games WHERE id = ?', [id]);
    return {};
  },
  async findBy(by = {}) {
    const db = await dbP;
    const genericFind = (field, value) => db.query('SELECT * FROM games WHERE ::field REGEXP :value', {
      field, value,
    })
      .then(R.prop(0));
    const acceptedQueries = R.pickAll(['name', 'location', 'status']);
    const queries = R.mapObjIndexed((value, key) => genericFind(key, value));
    const results = await Promise.all(R.pipe(
      acceptedQueries,
      R.filter(R.complement(R.isNil)),
      R.ifElse(R.isEmpty, () => this.getAll(), queries), // TODO this won't work
      R.values,
    )(by));
    const limitIfHave = R.ifElse(R.always(R.prop('limit', by)), R.take(R.prop('limit', by)), R.identity);
    return R.pipe(R.reduce(R.concat, []), R.uniqBy(R.prop('id')), limitIfHave, R.map(decodeGame))(results);
  },
  async update({
    id, name, status, location, ...meta
  }) {
    const db = await dbP;
    return db.query(
      'UPDATE games SET name=:name, status=:status, location=:location, meta=:meta WHERE id = :id',
      {
        name, status, location, meta: JSON.stringify(meta), id,
      },
    );
  },
  async migrate() {
    const db = await dbP;
    return db.query("CREATE TABLE `games` ( `id` VARCHAR(32) NOT NULL , `name` VARCHAR(64) NOT NULL , `location` VARCHAR(64) NOT NULL , `status` ENUM('OPEN','ONGOING','EXPIRED','CANCELLED') NOT NULL , `meta` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
  },
  async drop() {
    const db = await dbP;
    return db.query('DROP TABLE `games`');
  },
});

