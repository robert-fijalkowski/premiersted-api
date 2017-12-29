/* eslint-disable global-require */
/* eslint-env jest */

const configTest = require('../app/utils/config-test-http');
const config = require('../app/config');

config(configTest);

const app = require('../app/app')();
const request = require('supertest')(app);
const R = require('ramda');
const db = require('../app/db');
const { getToken } = require('../app/utils/jwt');


describe('http test', () => {
  beforeAll(() => {
    const migrations = R.pipe(R.filter(R.prop('migrate')), R.pluck('migrate'), R.values)(db);
    return Promise.all(migrations.map(d => d()));
  });
  describe('clubs', () => require('./clubs.suite')({ request }));
  describe('users', () => {
    const id = 'admin:1';
    let token;
    beforeAll(async () => {
      await db.users.store({ id });
      await db.users.setAccess({ id, access: 'ADMIN' });
      token = getToken({ user: { id } });
    });
    require('./users.suite')({ request, token: () => token, id });
    afterAll(() => db.users.delete({ id }));
  });
  describe('admin', () => {
    const id = 'admin:1';
    const userId = 'user:1';
    let token;
    beforeAll(async () => {
      await db.users.store({ id });
      await db.users.store({ id: userId });
      await db.users.setAccess({ id, access: 'ADMIN' });
      token = getToken({ user: { id, access: 'ADMIN' } });
    });
    require('./admin.suite')({ request, token: () => token, user: { id: userId } });
    afterAll(() => db.users.delete({ id }));
  });
  afterAll(async () => {
    const actualConn = await db.conn(config(configTest));
    const drops = R.pipe(R.filter(R.prop('drop')), R.pluck('drop'), R.values)(db);
    await Promise.all(drops.map(d => d()));
    await actualConn.end();
  });
});
