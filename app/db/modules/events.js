module.exports = dbP => ({
  async migrate() {
    const db = await dbP;
    return db.query('CREATE TABLE IF NOT EXISTS `events` ( `id` VARCHAR(32) NOT NULL ,`type` VARCHAR(16), `relate` VARCHAR(16) , created DATETIME on UPDATE CURRENT_TIMESTAMP, `meta` TEXT NOT NULL , PRIMARY KEY (`id`), INDEX (`relate`)) ENGINE = InnoDB;');
  },

  async drop() {
    const db = await dbP;
    return db.query('DROP TABLE IF EXISTS `events`;');
  },
});

