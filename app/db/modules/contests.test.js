/* eslint-env jest, node */
require('mysql2/promise');

const configTest = require('../../utils/config-test');

const config = require('../../config');

config(configTest);

const { contests, conn } = require('../index');

const chance = require('chance')();
const randomatic = require('randomatic');
const R = require('ramda');

const gids = [randomatic('Aa0', 5), randomatic('Aa0', 5), randomatic('Aa0', 5)];
const uids = chance.n(() => `github:${chance.natural({
  min: 100000, max: 2000000,
})}`, 5);

const samples = R.pipe(
  () => R.xprod(uids, uids),
  R.filter(([a, b]) => a !== b),
  R.xprod(gids),
  R.map(([gid, [home, visitor]]) => ({
    gid, home, visitor, id: randomatic('Aa0', 6),
  })),
)();
const sampleContest = {
  gid: 'game:1', home: 'uid:1', id: 'contest-1', visitor: 'uid2', extra: 'data',
};
describe('competitors management', () => {
  it('stub db', async () => {
    await contests.migrate();
  });

  it('should be able to add contest', async () => {
    await contests.create(sampleContest);
    const contest = await contests.findById({ id: sampleContest.id });
    expect(contest).toMatchObject({ ...sampleContest, status: 'SCHEDULED' });
  });

  it('feed db ', () => Promise.all(samples.map(contests.create)));

  it('should be able to fetch contests for game id', async () => {
    const gid = chance.pickone(gids);
    const contestList = await contests.find({ gid });
    contestList.forEach((aContest) => {
      expect(aContest).toMatchObject({ gid });
    });
  });

  it('should be able to fetch contests for user id', async () => {
    const uid = chance.pickone(uids);
    const contestList = await contests.find({ uid });
    expect(contestList).toHaveLength((uids.length - 1) * 2 * gids.length);
    contestList.forEach(({ visitor, home }) => {
      expect([visitor, home]).toContain(uid);
    });
  });

  it('should be able to update contest', async () => {
    const { id } = chance.pickone(samples);
    const contest = await contests.findById({ id });
    await contests.update({ ...contest, status: 'PLAYED', result: { home: 1, visitor: 2 } });
    const updated = await contests.findById({ id });
    expect(updated).toMatchObject({ status: 'PLAYED', result: { home: 1, visitor: 2 } });
  });

  it('should be able to fetch contests by status', async () => {
    const contestList = await contests.find({ status: 'PLAYED' });
    expect(contestList).toHaveLength(1);
    expect(contestList[0]).toMatchObject({ result: { home: 1, visitor: 2 } });
  });

  it('should be able to delete contest', async () => {
    const { id } = chance.pickone(samples);
    await contests.delete({ id });
    const updated = await contests.findById({ id });
    expect(updated).toBeNull();
  });
  it('drop db', async () => {
    await contests.drop();
    (await conn(config())).end();
  });
});
