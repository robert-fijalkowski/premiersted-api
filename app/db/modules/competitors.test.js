/* eslint-env jest, node */
require('mysql2/promise');

const configTest = require('../../utils/config-test');

const config = require('../../config');

config(configTest);

const {
  competitors, conn,
} = require('../index');

const chance = require('chance')();
const randomatic = require('randomatic');
const R = require('ramda');

const gids = [randomatic('Aa0', 5), randomatic('Aa0', 5), randomatic('Aa0', 5)];
const uids = chance.n(() => `github:${chance.natural({
  min: 100000, max: 2000000,
})}`, 5);

describe('competitors management', () => {
  it('stub db', async () => {
    await competitors.migrate();
  });
  it('feed db', async () => {
    let aClub = 0;
    const samples = R.pipe(
      R.xprod,
      R.map(([gid, uid]) => ({
        gid,
        uid,
        club: aClub++, // eslint-disable-line
      })),
      R.reduce(R.concat, R.__, []),
    )(gids, uids);
    await Promise.all(samples.map((c => competitors.add(c))));
  });
  it('can fetch only for particular game id', async () => {
    const gid = chance.pickone(gids);
    const list = await competitors.find({ gid });
    expect(list).toHaveLength(uids.length);
    list.forEach((competitor) => {
      expect(competitor).toMatchObject({ gid });
    });
  });

  it('can fetch only for particular uid id', async () => {
    const uid = chance.pickone(uids);
    const list = await competitors.find({ uid });
    expect(list).toHaveLength(gids.length);
    list.forEach((competitor) => {
      expect(competitor).toMatchObject({ uid });
    });
  });

  it('can fetch only for particular club id', async () => {
    const club = '1';
    const [relatedToClub] = await competitors.find({ club });
    const list = await competitors.find({ club, gid: relatedToClub.gid });
    expect(list).toHaveLength(1);
    list.forEach((competitor) => {
      expect(competitor).toMatchObject({ club, gid: relatedToClub.gid, ...relatedToClub });
    });
  });

  it('can fetch only one entry', async () => {
    const uid = chance.pickone(uids);
    const gid = chance.pickone(gids);

    const list = await competitors.find({ uid, gid });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ uid, gid });
  });

  it('can delete one entry', async () => {
    const uid = chance.pickone(uids);
    const gid = chance.pickone(gids);

    await competitors.delete({ uid, gid });
    const list = await competitors.find({ uid, gid });
    expect(list).toHaveLength(0);
  });

  it('should return no records for empty query', async () => {
    const list = await competitors.find({ });
    expect(list).toHaveLength(0);
  });

  it('drop db', async () => {
    await competitors.drop();
    (await conn(config())).end();
  });
});
