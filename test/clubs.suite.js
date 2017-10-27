/* eslint-disable global-require */
/* eslint-env jest */

module.exports = ({ request }) => {
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
};
