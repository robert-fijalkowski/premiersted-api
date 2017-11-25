/* eslint-disable global-require */
/* eslint-env jest */
const { exec } = require('./split-nosplit');
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

const makeArgs = continueIn => ({ continueIn });

describe(__filename, () => {
  it('should no split people', async () => {
    const args = makeArgs('Next League');
    const result = await exec({ game, args });
    const { toComplete, toCreate } = parseChanges(result);
    expect(toComplete).toMatchObject(completeGame({ id: game.id }));
    expect(toCreate).toHaveLength(1);
    expect(toCreate[0].item.competitors).toHaveLength(3);
    expect(toCreate[0]).toMatchObject(createGame({
      name: 'Next League',
      location: game.location,
      competitors: [
        { uid: 'fake:2', club: '012' },
        { uid: 'github:22493388', club: '004' },
        { uid: 'github:5791952', club: '002' },
      ],
    }));
  });
});
