/* eslint-disable global-require */
/* eslint-env jest */
const { exec } = require('./split-byid');
const { createGame, completeGame, parseChanges } = require('./operations');


const game = {
  id: 'zVR7C',
  location: 'Gdańsk',
  status: 'ONGOING',
  table: [
    { id: 'github:22493388', position: 1 },
    { id: 'github:5791952', position: 1 },
    { id: 'fake:2', position: 3 },
  ],
  competitors: {
    'fake:2': { club: { id: '012' } },
    'github:22493388': { club: { id: '004' } },
    'github:5791952': { club: { id: '002' } },
  },
  competitorsSize: 3,
};

const newGame = (name, ...competitors) => ({ name, competitors });
const makeArgs = (...continueIn) => ({ continueIn });

describe(__filename, () => {
  it('should ', async () => {
    const args = makeArgs(
      newGame('Lesser League', 'fake:2'),
      newGame('Upper League', 'github:22493388'),
      newGame('Playoff League', 'github:5791952'),
    );
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject(completeGame({ id: game.id }));
    expect(toCreate).toHaveLength(3);
    expect(toCreate[0].item.competitors).toHaveLength(1);
  });
  it('should create proper patches', async () => {
    const args = makeArgs(
      newGame('Lesser League', 'fake:2'),
      newGame('Upper League', 'github:22493388', 'github:5791952'),
    );
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject({ item: { id: game.id } });
    expect(toCreate).toHaveLength(2);
  });

  it('should create proper patches', async () => {
    const args = makeArgs(newGame('Upper League', 'fake:2', 'github:22493388', 'github:5791952'));
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject({ item: { id: game.id } });
    expect(toCreate).toHaveLength(1);
    expect(toCreate[0]).toMatchObject(createGame({
      name: 'Upper League',
      location: 'Gdańsk',
      competitors: [
        { uid: 'fake:2', club: '012' },
        { uid: 'github:22493388', club: '004' },
        { uid: 'github:5791952', club: '002' },
      ],
    }));
  });
});
