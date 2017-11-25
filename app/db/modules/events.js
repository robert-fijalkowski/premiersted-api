const randomatic = require('randomatic');

const decodeEvent = ({ meta = '{}', created, ...fields }) => ({
  ...JSON.parse(meta),
  created: new Date(created).toString(),
  ...fields,
});

module.exports = dbP => ({
  async add({ type, relate, ...meta }) {
    const db = await dbP;
    return db.query('INSERT INTO events(id, relate, type, meta,created) VALUES (:id, :relate,:type, :meta, NOW())', {
      id: randomatic('Aa0', 8),
      relate,
      type,
      meta: JSON.stringify(meta),
    });
  },
  async find({ type, relate, limit = 10, offset = 0 }) { // eslint-disable-line
    const db = await dbP;
    const [results] = await db.query(
      `SELECT * FROM events WHERE type=:type AND relate=:relate ORDER by created DESC LIMIT ${parseInt(offset, 10)},${parseInt(limit, 10)}`,
      { type, relate },
    );

    return results.map(decodeEvent);
  },
  async scan(type) {
    const db = await dbP;
    const [results] = await db.query(
      'SELECT type,relate, COUNT(*) as `count` FROM events WHERE type=:type GROUP by type, relate',
      { type },
    );
    return results;
  },
  async findById({ id }) {
    const db = await dbP;
    const [[result]] = await db.query('SELECT * FROM events WHERE id = :id', { id });
    if (!result) {
      return null;
    }
    return decodeEvent(result);
  },
  async migrate() {
    const db = await dbP;
    return db.query('CREATE TABLE IF NOT EXISTS `events` ( `id` VARCHAR(32) NOT NULL ,`type` VARCHAR(16) NOT NULL, `relate` VARCHAR(16) NOT NULL, created DATETIME DEFAULT CURRENT_TIMESTAMP, `meta` TEXT NOT NULL , PRIMARY KEY (`id`), INDEX (`relate`)) ENGINE = InnoDB;');
  },

  async drop() {
    const db = await dbP;
    return db.query('DROP TABLE IF EXISTS `events`;');
  },
});
