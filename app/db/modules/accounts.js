const R = require('ramda');

module.exports = dbP => ({
  async add({ providerId, id }) {
    const db = await dbP;
    return db.query('INSERT INTO `accounts` (id, providerId) VALUES (:id, :providerId)', { id, providerId })
      .then(() => db.query('SELECT * FROM accounts WHERE providerId=? LIMIT 1;', [providerId]))
      .then(R.head)
      .then(R.head);
  },
  async findByProviderId(providerId) {
    const db = await dbP;
    const [[account]] = await db.query('SELECT * FROM accounts WHERE providerId=? LIMIT 1;', [providerId]);
    if (!account) {
      return null;
    }
    return account.id;
  },
  async findById(id) {
    const db = await dbP;
    const [providers] = await db.query('SELECT * FROM accounts WHERE id=?;', [id]);
    return R.pluck('providerId', providers);
  },
  async delete({ providerId }) {
    const db = await dbP;
    return db.query('DELETE FROM `accounts` WHERE providerId=:providerId', { providerId });
  },
  async migrate() {
    const db = await dbP;
    return db.query('CREATE TABLE IF NOT EXISTS `accounts` ( `id` VARCHAR(32) NOT NULL , `providerId` VARCHAR(32) NOT NULL, PRIMARY KEY (`providerId`), UNIQUE KEY (`id`, `providerId`)) ENGINE = InnoDB;');
  },
  async drop() {
    const db = await dbP;
    return db.query('DROP TABLE IF EXISTS `accounts`;');
  },
});

