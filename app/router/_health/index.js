const { connection } = require('../../db');
const R = require('ramda');

module.exports = async (req, res) => {
  try {
    const db = await connection;
    const [result] = await db.execute('SHOW TABLES;');
    const tablesLength = R.pipe(R.map(R.values), R.flatten, R.length)(result);
    if (tablesLength > 0) {
      return res.status(200).send(`OK: ${tablesLength}`);
    }
    throw new Error('Database should contain at least 1 table!');
  } catch (e) {
    console.log(e);
    return res.status(503).send('Unhealthy');
  }
};

