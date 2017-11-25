/* eslint-disable global-require */
/* eslint-env jest */
const { exec } = require('./split-position');
const { createGame, completeGame, parseChanges } = require('./operations');
const R = require('ramda');

const game = {
  id: 'zVR7C',
  location: 'Gdańsk',
  status: 'ONGOING',
  table: [
    { id: 'github:22493388', position: 1 },
    { id: 'github:5791952', position: 2 },
    { id: 'fake:2', position: 3 },
    { id: 'fake:4', position: 4 },
    { id: 'fake:3', position: 5 },
  ],
  competitors: {
    'fake:2': { club: { id: '012' } },
    'fake:3': { club: { id: '016' } },
    'fake:4': { club: { id: '018' } },
    'github:22493388': { club: { id: '004' } },
    'github:5791952': { club: { id: '002' } },
  },
  competitorsSize: 3,
};

const newGame = (name, from, to) => ({ name, from, to });
const makeArgs = (...continueIn) => ({ continueIn });

describe(__filename, () => {
  it('should ', async () => {
    const args = makeArgs(
      newGame('Lesser League', 3),
      newGame('Upper League', 1, 3),
      newGame('Playoff League', 2, 6),
    );
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject(completeGame({ id: game.id }));
    expect(toCreate).toHaveLength(3);
    expect(toCreate[0].item.competitors).toHaveLength(3);
  });
  it('should create proper patches', async () => {
    const args = makeArgs(
      newGame('Upper League', 1, 3),
      newGame('Lesser League', 4),
    );
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject({ item: { id: game.id } });
    expect(toCreate).toHaveLength(2);
    expect(R.find(R.pathEq(['item', 'name'], 'Upper League'), toCreate).item)
      .toMatchObject({
        competitors: [
          { uid: 'github:22493388', club: '004' },
          { uid: 'github:5791952', club: '002' },
          { uid: 'fake:2', club: '012' },
        ],
      });
    expect(R.find(R.pathEq(['item', 'name'], 'Lesser League'), toCreate).item)
      .toMatchObject({
        competitors: [
          { uid: 'fake:4', club: '018' },
          { uid: 'fake:3', club: '016' },
        ],
      });
  });

  it('should create proper patches', async () => {
    const args = makeArgs(newGame('Next League', 1));
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject({ item: { id: game.id } });
    expect(toCreate).toHaveLength(1);
    expect(toCreate[0]).toMatchObject(createGame({
      name: 'Next League',
      location: 'Gdańsk',
      competitors: [
        { uid: 'github:22493388', club: '004' },
        { uid: 'github:5791952', club: '002' },
        { uid: 'fake:2', club: '012' },
        { uid: 'fake:4', club: '018' },
        { uid: 'fake:3', club: '016' },
      ],
    }));
  });
});
