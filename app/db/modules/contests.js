const R = require('ramda');

const decodeContest = contest => ({
  ...contest,
  meta: undefined,
  ...JSON.parse(contest.meta),
  updated: new Date(contest.updated).toUTCString(),
});
const prepareConditions = (params) => {
  const genericFind = field => `${field} = ?`;

  const [sql, injects] = R.toPairs(params)
    .filter(([key]) => key !== 'uid')
    .reduce(([query, values], [field, value]) =>
      [[...query, genericFind(field)], [...values, value]], [[], []]);
  if (R.prop('uid', params)) {
    const uid = R.prop('uid', params);
    sql.push('(visitor = ? OR home = ?)');
    injects.push(uid, uid);
  }
  return [sql, injects];
};

module.exports = dbP => ({
  async create({
    id, gid, home, visitor, ...meta
  }) {
    const db = await dbP;
    await db.query(
      `INSERT INTO contests(id,home,visitor,gid,status,meta) values 
      (:id,:home,:visitor,:gid,'SCHEDULED',:meta)`,
      {
        id, home, visitor, gid, meta: JSON.stringify(meta),
      },
    );
  },
  async findById({ id }) {
    const db = await dbP;
    const [[contest]] = await db.query('SELECT * FROM contests WHERE id = :id LIMIT 1', { id });
    if (!contest) {
      return null;
    }
    return decodeContest(contest);
  },

  async find(params = {}) {
    const db = await dbP;
    const [sql, injects] = prepareConditions(params);
    const results = await R.cond([
      [R.isEmpty, R.always([])],
      [R.T, () => db.query(`SELECT * FROM contests WHERE ${sql.join(' AND ')} ORDER by updated DESC`, injects)],
    ])(injects);
    return R.pipe(R.head, R.map(decodeContest))(results);
  },
  async update({
    id, status, ...meta
  }) {
    const db = await dbP;
    // because gid, visitor, home and updated are IMMUTABLE
    const prepareMeta = R.pipe(R.omit(['gid', 'visitor', 'home', 'updated']), JSON.stringify);
    return db.query(
      'UPDATE contests SET meta=:meta, status=:status, updated=NOW() WHERE id = :id',
      { meta: prepareMeta(meta), id, status },
    );
  },
  async delete({ id }) {
    const db = await dbP;
    return db.query('DELETE FROM contests WHERE id = :id', { id });
  },
  async migrate() {
    const db = await dbP;
    await db.query("CREATE TABLE `contests` ( `id` VARCHAR(32) NOT NULL , `home` VARCHAR(32) NOT NULL ,`visitor` VARCHAR(32) NOT NULL , `gid` VARCHAR(32) NOT NULL ,`status` ENUM('SCHEDULED','PLAYED','ONGOING','WALKOVER') NOT NULL,`updated` TIMESTAMP NOT NULL , `meta` TEXT NOT NULL , PRIMARY KEY (`id`), INDEX (`home`),INDEX(`visitor`), INDEX (`gid`)) ENGINE = InnoDB;");
  },
  async drop() {
    const db = await dbP;
    return db.query('DROP TABLE `contests`;');
  },
});

