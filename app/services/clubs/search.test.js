/* eslint-env jest,node */
const { data } = require('./data');
const searchF = require('./search');

const search = (q, d = data) => searchF(q)(d);

const chance = require('chance')();

describe('search algorithm ', () => {
  it('should use search to find the same team at the top', () => {
    const club = chance.pickone(data);
    const limit = 10;
    const result = search({
      search: `${club.name},${club.division}`, limit, atLeast: 'poor',
    });
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({ ...club, quality: 'excellent' });
  });
  it('search for many results', () => {
    const limit = 5;
    const results = search({
      search: 'Czelsi', limit, debug: 1, atLeast: 'poor',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(10);
    expect(results[0]).toMatchObject({ quality: 'excellent' });
  });
});
