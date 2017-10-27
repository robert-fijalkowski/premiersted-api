/* eslint-disable global-require */
/* eslint-env jest */
const authWith = require('./authWith');

module.exports = ({ request, token, user }) => {
  let auth;
  beforeAll(() => {
    auth = authWith(request, token());
  });

  it('should be able to check if user is not admin', async () => {
    const { statusCode, body } = await auth.get(`/users/${user.id}`);
    expect(statusCode).toEqual(200);
    expect(body).toMatchObject({ id: user.id, access: 'NONE' });
  });

  it('should be able to promote user to admin', async () => {
    const { statusCode, body } = await auth.put(`/users/${user.id}`, { access: 'ADMIN' });
    expect(statusCode).toEqual(200);
    expect(body).toMatchObject({ id: user.id, access: 'ADMIN' });
  });
};
