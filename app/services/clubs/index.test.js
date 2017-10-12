/* eslint-env jest,node */
const clubs = require('./index');
const data = require('./clubs.json');
const chance = require('chance')();

describe('filtering ', () => {
  it('should return all data for no filter', () => {
    expect(clubs.get()).toEqual(data);
  });
  it('should return sample basing on id', () => {
    const sample = chance.pickone(data);
    expect(clubs.get({ id: sample.id })).toEqual(sample);
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
    expect(result[0]).toMatchObject(sample);
  });
  it('should be threat as search', () => {
    const name = 'Madrid';
    const result = clubs.get({ name });
    expect(result).toHaveLength(2);
    result.forEach(club => expect(club.name).toMatch(name));
  });
});
