const R = require('ramda');

const decodeUser = user => ({ ...R.omit(R.prop('meta'), user),
  meta: (JSON.parse(user.meta)) });
module.exports = dbP => ({
  async findById(id) {
    const db = await dbP;
    const [[user]] = await db.execute('SELECT * FROM users WHERE id=? LIMIT 1;', [id]);
    if (!user) {
      return null;
    }
    return decodeUser(user);
  },
  async getAll() {
    const db = await dbP;
    const [users] = await db.execute('SELECT * FROM users', []);
    return users.map(decodeUser);
  },
  async store({ id, ...rest }) {
    const db = await dbP;
    db.execute('INSERT INTO users(id, access, meta) VALUES(?,?,?)', [id, 'NONE', JSON.stringify(rest)]);
    return this.findById(id);
  },
  async updateMeta({ id, meta, access, ...rest }) {
    const db = await dbP;
    await db.execute('UPDATE users SET meta=? WHERE id=?', [JSON.stringify({ ...meta, ...rest }), id]);
    return this.findById(id);
  },
  async setAccess({ id, access }) {
    const db = await dbP;
    await db.execute('UPDATE users SET access=? WHERE id=?', [access, id]);
    return this.findById(id);
  },
  async migrate() {
    const db = await dbP;
    return db.execute("CREATE TABLE `users` ( `id` VARCHAR(32) NOT NULL , `access` ENUM('NONE','USER','ADMIN','') NOT NULL , `meta` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
  },
});

