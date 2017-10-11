module.exports = db => ({
  findById(id) {
    return db.execute('SELECT * FROM users');
  },
  store({ id, ...rest }) {

  },
  migrate() {
    return db.execute(`
      CREATE TABLE users(
        id text
      )
    `);
  },
});

