const R = require('ramda');
const randomatic = require('randomatic');

module.exports = dbP => ({
  async create({
    gid, home, away, ...meta
  }) {
    const db = await dbP;
    const id = randomatic('Aa0', 6);
    await db.execute(
      `INSERT INTO contests(id,home,away,gid,status,meta) values 
      (:id,:home,:away,:gid,'SCHEDULED',:meta)`,
      {
        id, home, away, gid, meta: JSON.stringify(meta),
      },
    );
  },
  async find(query = {}) {
    const db = await dbP;
    const paramsCount = n => R.pipe(R.values, R.length, R.equals(n));
    const where = (sql, substs) => db.query(`SELECT * FROM contests WHERE ${sql}`, substs).then(R.prop(0));

    const exactMatch = R.both(paramsCount(1), R.prop('id'));
    const validCompetors = R.both(paramsCount(2), R.anyPass(R.prop('home'), R.prop('away')));
    const allGameMatches = R.both(paramsCount(1), R.prop('gid'));
    return R.cond([
      [exactMatch, async ({ id }) => where('id = ?', [id])],
      [R.T, R.always([])],
    ])(query);
  },
  async delete() {
    const db = await dbP;
    return {};
  },
  async migrate() {
    const db = await dbP;
    await db.execute("CREATE TABLE `contests` ( `id` VARCHAR(32) NOT NULL , `home` VARCHAR(32) NOT NULL ,`away` VARCHAR(32) NOT NULL , `gid` VARCHAR(32) NOT NULL ,`status` ENUM('SCHEDULED','PLAYED','WALKOVER') NOT NULL,`updated` TIMESTAMP NOT NULL , `meta` TEXT NOT NULL , PRIMARY KEY (`id`), INDEX (`home`),INDEX(`away`), INDEX (`gid`)) ENGINE = InnoDB;");
  },
  async drop() {
    const db = await dbP;
    return db.execute('DROP TABLE `contests`;');
  },
});

