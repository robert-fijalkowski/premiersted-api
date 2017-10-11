/* eslint-env jest, node */
require('mysql2/promise');

const configTest = require('../../utils/config-test');

const config = require('../../config');

config(configTest);

const { games } = require('../index');

const gameData = {
  name: 'League', location: 'Gdańsk', img: 'some-image-data', otherMeta: 'Best Game',
};
describe('Connect to db', () => {
  it('stub db', () => games.migrate());
  it('should create league with status open with some ID', async () => {
    const obj = gameData;
    const game = await games.create(obj);
    expect(game).toMatchObject({ ...gameData, meta: undefined });
  });
  it('should locate the team by name', async () => {
    const game = await games.findBy({ name: 'League' });
    expect(game[0]).toMatchObject(gameData);
  });
  it('should locate teams by location and name', async () => {
    const game = await games.findBy({ location: 'Gdańsk' });
    expect(game[0]).toMatchObject(gameData);
  });
  it('drop db', () => games.drop());
});
