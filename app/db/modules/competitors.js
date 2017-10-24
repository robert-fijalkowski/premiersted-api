const R = require('ramda');

module.exports = dbP => ({
  async add({ gid, uid, club }) {
    const db = await dbP;
    await db.query(
      'INSERT INTO competitors(gid,uid,club) values (:gid, :uid,:club) ON DUPLICATE KEY UPDATE club=VALUES(club)',
      { gid, uid, club },
    );
  },

  async find(params = {}) {
    const db = await dbP;
    const genericFind = field => `${field} = ?`;
    const [sql, injects] = R.toPairs(params)
      .reduce(([query, values], [field, value]) =>
        [[...query, genericFind(field)], [...values, value]], [[], []]);
    return R.cond([
      [R.isEmpty, R.always([])],
      [R.T, () => db.query(`SELECT * FROM competitors WHERE ${sql.join(' AND ')}`, injects).then(R.head)],
    ])(injects);
  },

  async delete({ gid, uid }) {
    const db = await dbP;
    return db.query('DELETE FROM competitors WHERE gid=:gid AND uid=:uid', { gid, uid });
  },

  async migrate() {
    const db = await dbP;
    await db.query('CREATE TABLE `competitors` ( `gid` VARCHAR(32) NOT NULL , `uid` VARCHAR(32) NOT NULL , `club` INT NOT NULL ) ENGINE = InnoDB;');
    await db.query('ALTER TABLE `competitors` ADD PRIMARY KEY (`gid`,`uid`), ADD KEY `gid` (`gid`), ADD KEY `uid` (`uid`);');
    await db.query('ALTER TABLE `competitors` CHANGE `club` `club` VARCHAR(5) NOT NULL;');
  },

  async drop() {
    const db = await dbP;
    return db.query('DROP TABLE `competitors`;');
  },
});

