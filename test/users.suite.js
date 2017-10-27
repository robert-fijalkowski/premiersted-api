/* eslint-disable global-require */
/* eslint-env jest */
const authWith = require('./authWith');

module.exports = ({ request, token, id }) => {
  let auth;
  beforeAll(() => {
    auth = authWith(request, token());
  });

  it('should not get user list as non-auth user', async () => {
    const { statusCode, text } = await request.get('/users');
    expect(statusCode).toEqual(401);
    expect(text).toMatch('no token provided');
  });
  it('should get user list as auth user', async () => {
    const { statusCode, body } = await auth.get('/users');
    expect(statusCode).toEqual(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id, access: 'ADMIN' });
  });
  it('should get myself profile as auth user', async () => {
    const { statusCode, body } = await auth.get('/users/i');
    expect(statusCode).toEqual(200);
    expect(body).toMatchObject({
      id, access: 'ADMIN', games: {}, contests: [],
    });
  });
  it('should get user basing on user id request', async () => {
    const { statusCode, body } = await auth.get(`/users/${id}`);
    expect(statusCode).toEqual(200);
    expect(body).toMatchObject({
      id, access: 'ADMIN', games: {}, contests: [],
    });
  });
  it('should get not found for non-existing user', async () => {
    const { statusCode } = await auth.get('/users/non-exists');
    expect(statusCode).toEqual(404);
  });

  it('should be able to update user meta-data', async () => {
    const { statusCode, body } = await auth.put(`/users/${id}`, { name: 'Frederic' });
    expect(statusCode).toEqual(200);
    expect(body).toMatchObject({ id, access: 'ADMIN', meta: { name: 'Frederic' } });
  });
};
