/* eslint-disable global-require */
/* eslint-env jest */

const configTest = require('./utils/config-test');
const config = require('./config');

config(configTest);

const app = require('./app');
const request = require('supertest')(app);
const R = require('ramda');
const db = require('./db');
const { getToken } = require('./utils/jwt');

describe('http test', () => {
  if (process.env.TEST_HTTP) {
    beforeAll(() => {
      const migrations = R.pipe(R.filter(R.prop('migrate')), R.pluck('migrate'), R.values)(db);
      return Promise.all(migrations.map(d => d()));
    });
    describe('clubs', () => {
      it('should get List of clubs', async () => {
        const { body, statusCode } = await request.get('/clubs');
        expect(statusCode).toEqual(200);
        expect(body.length).toBeGreaterThan(200);
      });
      it('shoule be able to search for a club', async () => {
        const { body, statusCode } = await request.get('/clubs?search=Sampdoria');
        expect(statusCode).toEqual(200);
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({
          id: '142',
          quality: 'excellent',
          name: 'Sampdoria',
          division: 'Serie A',
        });
      });
      it('should be able to search for a club Bayern Munich', async () => {
        const { body, statusCode } = await request.get('/clubs/002');
        expect(statusCode).toEqual(200);
        expect(body).toMatchObject({ name: 'FC Bayern Munich', country: 'Germany', division: 'Bundesliga' });
      });
      it('should return BadRequest for invalid club get', async () => {
        const { statusCode, text } = await request.get('/clubs/invalid');
        expect(statusCode).toEqual(400);
        expect(text).toEqual('Bad Request: Invalid request type invalid');
      });
    });
    describe('authenticated things', () => {
      let token;
      beforeAll(async () => {
        const user = { id: 'admin:1', access: 'ADMIN' };
        await db.users.store(user);
        await db.users.setAccess(user);
        token = getToken({ user });
      });
      it('should not get user list as auth user', async () => {
        const { statusCode, text } = await request.get('/users');
        expect(statusCode).toEqual(401);
        expect(text).toMatch('no token provided');
      });
      it('should get user list as auth user', async () => {
        const { statusCode, body } = await request.get('/users').set('auth-token', token);
        expect(statusCode).toEqual(200);
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({ id: 'admin:1', access: 'ADMIN' });
      });
      it('should get myself profile as auth user', async () => {
        const { statusCode, body } = await request.get('/users/i').set('auth-token', token);
        expect(statusCode).toEqual(200);
        expect(body).toMatchObject({
          id: 'admin:1', access: 'ADMIN', games: {}, contests: [],
        });
      });
    });
    afterAll(() => {
      const drops = R.pipe(R.filter(R.prop('drop')), R.pluck('drop'), R.values)(db);
      return Promise.all(drops.map(d => d()));
    });
  } else {
    it('specify TEST_HTTP=1 to run http tests', () => {

    });
  }
});
