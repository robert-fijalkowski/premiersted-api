/* eslint-env jest,node */
const { data } = require('./index');
const searchF = require('./search');

const search = q => searchF(q)(data);

const chance = require('chance')();

describe('search algorithm ', () => {
  it('should use search to find the same team at the top', () => {
    const club = chance.pickone(data);
    const limit = 10;
    const result = search({
      search: `${club.name},${club.division}`, limit, atLeast: 'good',
    });
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result[0]).toMatchObject({ ...club, quality: 'excellent' });
  });
});
