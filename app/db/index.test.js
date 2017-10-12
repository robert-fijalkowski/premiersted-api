/* eslint-env jest, node */

const configTest = require('../utils/config-test');

const config = require('../config');

config(configTest);

const {
  conn, credentials,
} = require('./index');

describe('Connect to db', () => {
  it('should create correct credentials object', () => {
    const creds = credentials(config());
    expect(creds).toMatchObject({
      database: 'premiersted-it',
      host: 'localhost',
      password: 'premiersted',
      user: 'root',
    });
  });
  it('should create connection', async () => {
    const db = await conn(config());
    const [result] = await db.execute('SELECT 1+1 as res;');
    expect(result[0].res).toBe(2);
    await db.end();
  });
});
