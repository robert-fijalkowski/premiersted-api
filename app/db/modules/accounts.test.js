/* eslint-env jest, node */
require('mysql2/promise');

const configTest = require('../../utils/config-test');

const config = require('../../config');

config(configTest);

const { accounts } = require('../index');

const sample = { providerId: 'githin:1', id: 'psted:1' };
const nextSample = { providerId: 'facen:1', id: 'psted:1' };
describe('games management', () => {
  beforeAll(() => accounts.migrate());

  it('should create id-provider connection', async () => {
    const allGames = await accounts.add(sample);
    expect(allGames).toEqual(sample);
  });

  it('should fail for duplicated creation id-provider connection', async () => {
    const allGames = accounts.add(sample);
    expect(allGames).rejects.toBeDefined();
  });

  it('should create another  id-provider connection', async () => {
    const allGames = await accounts.add(nextSample);
    expect(allGames).toEqual(nextSample);
  });

  it('should get id for existing providerId', async () => {
    const connectedId = await accounts.findByProviderId(sample.providerId);
    expect(connectedId).toEqual(sample.id);
  });

  it('should get all connections for id', async () => {
    const connectedId = await accounts.findById(sample.id);
    expect(connectedId).toContain(sample.providerId);
    expect(connectedId).toContain(nextSample.providerId);
  });

  it('should delete one connections for id', async () => {
    const connectedId = await (accounts.delete(sample).then(() => accounts.findById(sample.id)));
    expect(connectedId).toContain(nextSample.providerId);
  });
  afterAll(() => accounts.drop());
});
