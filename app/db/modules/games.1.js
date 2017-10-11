const R = require('ramda');
const randomatic = require('randomatic');

module.exports = dbP => ({
  async create({
    name, location, status, ...meta
  }) {
    const db = await dbP;
    const id = randomatic('Aa0', 5);
    await db.execute(
      'INSERT INTO games(id, name, location, status, meta) values ??',
      [id, name, location, status, JSON.stringify(meta)],
    );
  },
  async findById(id) {
    const db = await dbP;
  },
  async migrate() {
    const db = await dbP;
    return db.execute("CREATE TABLE `games` ( `id` VARCHAR(32) NOT NULL , `name` VARCHAR(64) NOT NULL , `location` VARCHAR(64) NOT NULL , `status` ENUM('OPEN','ONGOING','EXPIRED','CANCELLED') NOT NULL , `meta` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
  },
  async drop() {
    const db = await dbP;
    return db.execute('DROP TABLE `games`;');
  },
});

