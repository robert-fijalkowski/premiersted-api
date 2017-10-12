const R = require('ramda');

const numberOfQueries = n => R.pipe(R.values, R.length, R.equals(n));

module.exports = dbP => ({
  async add({
    gid, uid, club,
  }) {
    const db = await dbP;
    await db.execute(
      'INSERT INTO competitors(gid,uid,club) values (:gid, :uid,:club)',
      {
        gid, uid, club,
      },
    );
  },
  async find(query = {}) {
    const db = await dbP;
    const genericFind = (field, value) => db.query('SELECT * FROM competitors WHERE ::field = :value', {
      field, value,
    })
      .then(R.prop(0));
    return R.cond([
      [numberOfQueries(1), async q => genericFind(R.keys(q)[0], R.values(q)[0])],
      [numberOfQueries(2), async q => db.query('SELECT * FROM competitors WHERE gid = :gid AND uid=:uid', q).then(R.prop(0))],
      [R.T, R.always([])],
    ])(query);
  },
  async delete(query = {}) {
    const db = await dbP;
    const genericFind = (field, value) => db.query('DELETE FROM competitors WHERE ::field = :value', {
      field, value,
    }).then(R.always({}))
      .then(R.prop(0));
    return R.cond([
      [numberOfQueries(1), async q => genericFind(R.keys(q)[0], R.values(q)[0])],
      [numberOfQueries(2), async q => db.query('DELETE FROM competitors WHERE :gid = :gid AND uid=:uid', q).then(R.prop(0))],
      [R.T, R.always({})],
    ])(query);
  },
  async migrate() {
    const db = await dbP;
    await db.execute('CREATE TABLE `competitors` ( `gid` VARCHAR(32) NOT NULL , `uid` VARCHAR(32) NOT NULL , `club` INT NOT NULL ) ENGINE = InnoDB;');
    await db.execute('ALTER TABLE `competitors` ADD PRIMARY KEY (`gid`,`uid`), ADD KEY `gid` (`gid`), ADD KEY `uid` (`uid`);');
  },
  async drop() {
    const db = await dbP;
    return db.execute('DROP TABLE `competitors`;');
  },
});

