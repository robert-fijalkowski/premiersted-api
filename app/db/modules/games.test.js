/* eslint-env jest, node */
require('mysql2/promise');

const configTest = require('../../utils/config-test');

const config = require('../../config');

config(configTest);

const { games, conn } = require('../index');

const chance = require('chance')();

chance.mixin({ gdnkrk: () => chance.pickone(['Kraków', 'Gdańsk']),
  game: () => ({ name: chance.name(),
    location: chance.gdnkrk(),
    img: chance.hash() }) });

const sample = chance.game();

describe('games management', () => {
  it('stub db', async () => {
    await games.migrate();
  });
  it('should create league with status open with some ID', async () => {
    const game = await games.create(sample);
    expect(game).toMatchObject({ ...sample, meta: undefined });
    sample.id = game.id; // update sample to future lookup
  });

  it('should locate game by id', async () => {
    const game = await games.findById(sample.id);
    expect(game).toMatchObject(sample);
  });

  it('should locate the game by name', async () => {
    const game = await games.findBy({ name: sample.name });
    expect(game).toHaveLength(1);
    expect(game[0]).toMatchObject(sample);
  });
  it('should locate game by location', async () => {
    const game = await games.findBy({ location: sample.location });
    expect(game).toHaveLength(1);
    expect(game[0]).toMatchObject(sample);
  });

  it('should not duplicate entries during search both by location and name', async () => {
    const game = await games.findBy({ location: sample.location, name: sample.name });
    expect(game).toHaveLength(1);
    expect(game[0]).toMatchObject(sample);
  });
  it('load many games', async () => {
    const samples = chance.n(chance.game, 20);
    await Promise.all(samples.map(g => games.create(g)));
  });
  it('should get only from one location', async () => {
    const desiredLocation = chance.gdnkrk();
    const result = await games.findBy({ location: desiredLocation });
    result.forEach((oneSample) => {
      expect(oneSample).toMatchObject({ location: desiredLocation });
    });
  });
  it('should get only from location or contains a in name', async () => {
    const desiredLocation = chance.gdnkrk();
    const result = await games.findBy({ location: desiredLocation, name: 'a' });
    result.forEach((oneSample) => {
      if (oneSample.location !== desiredLocation) {
        expect(oneSample.name).toMatch(/a/i);
      } else {
        expect(oneSample).toMatchObject({ location: desiredLocation });
      }
    });
  });
  it('should modify particular game state', async () => {
    const game = chance.pickone(await games.getAll());
    const img = chance.hash();
    await games.update({ ...game, status: 'ONGOING', img });
    const updated = await games.findById(game.id);
    expect(updated).toMatchObject({ id: game.id, name: game.name, status: 'ONGOING', img });
  });
  it('should get plenty number of created games', async () => {
    const allGames = await games.getAll();
    expect(allGames.length).toEqual(21);
  });
  it('drop db', async () => {
    await games.drop();
    const db = await conn(config());
    db.end();
  });
});
