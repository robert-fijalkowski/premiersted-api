const { games, competitors, contests } = require('../../db');

const clubs = require('../clubs');
const users = require('../users');

const R = require('ramda');

module.exports = async ({ gid }) => {
  const game = await games.findById(gid);
  if (!game) {
    return null;
  }
  const listOfCompetitors = await competitors.find({ gid });
  const competitor = R.groupBy(
    R.prop('id'),
    await Promise.all(R.map(
      ({ uid }) => users.cachedFind({ id: uid }),
      listOfCompetitors,
    )),
  );
  const competitorList = R.mapTo(R.path(['user', 'id']), R.identity, R.map(
    R.pipe(R.omit(['gid']), ({ club, uid }) => ({
      club: clubs.get({ id: club }),
      user: competitor[uid][0],
    })),
    listOfCompetitors,
  ));
  const schedule = R.pipe(R.mapTo(
    R.prop('id'),
    R.identity,
  ))(await contests.find({ gid }));

  return {
    ...game,
    competitors: competitorList,
    schedule,
  };
};

