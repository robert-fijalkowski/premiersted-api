/* eslint-env jest,node */
const clubs = require('./index');

const { data } = require('./data');
const chance = require('chance')();
const R = require('ramda');

describe('clubs service', () => {
  it('should return all data for no filter', () => {
    expect(clubs.get()).toEqual(R.map(e => ({ ...e, keywords: undefined }), data));
  });
  it('should return sample basing on id', () => {
    const sample = chance.pickone(data);
    expect(clubs.get({ id: sample.id })).toEqual({ ...sample, keywords: undefined });
  });
  it('should return all related sample basing on division', () => {
    const sample = chance.pickone(data);
    const { division } = sample;
    clubs.get({ division })
      .forEach(club => expect(club).toMatchObject({ division }));
  });

  it('should return all related sample basing on division and score', () => {
    const sample = chance.pickone(data);
    const { division, score } = sample;
    clubs.get({ division, score })
      .forEach(club => expect(club).toMatchObject({ division, score }));
  });

  it('should return the same sample', () => {
    const sample = chance.pickone(data);
    const { name } = sample;
    const result = clubs.get({ name });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(R.omit(['keywords'], sample));
  });
  it('should be threat as search', () => {
    const name = 'Madrid';
    const result = clubs.get({ name: 'mADrID' });
    expect(result).toHaveLength(2);
    result.forEach(club => expect(club.name).toMatch(name));
  });
  it('should get only exact stars teams', () => {
    const stars = 4;
    const result = clubs.get({ stars });
    expect(result.length).toBeGreaterThan(30);
    result.forEach(club => expect(club.stars).toEqual(stars));
  });

  it('should use search', () => {
    const limit = 10;
    const result = clubs.get({
      search: 'Braga', limit, atLeast: 'good',
    });
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result[0]).toMatchObject({ name: 'SC Braga', id: '166' });
  });
});
