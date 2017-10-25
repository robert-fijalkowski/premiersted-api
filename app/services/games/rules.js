const { competitors, games, contests } = require('../../db');
const R = require('ramda');
const { Conflict, withError } = require('../../router/exceptions');

const isCompetitionsStillOpen = R.pathEq(['game', 'status'], 'OPEN');

const isInt = (value) => {
  if ((parseFloat(value) == parseInt(value, 10)) && !isNaN(value)) { // eslint-disable-line
    return true;
  }
  return false;
};
const not = R.complement;
module.exports = {
  addCompetitor: async ({ gid, club, uid }) => {
    const list = (await competitors.find({ gid, club })).filter(f => f.uid !== uid);
    const [game] = await games.teasers([gid]);
    const isClubAlreadyNotChosen = R.propEq('list', []);

    return R.cond([
      [not(isClubAlreadyNotChosen), withError(new Conflict('This club has been already chosen'))],
      [not(isCompetitionsStillOpen), withError(new Conflict('This competitions already started'))],
      [R.T, R.T],
    ])({ list, game });
  },
  schedule: async ({ gid, schedule }) => {
    const game = await games.findById(gid);
    return R.cond([
      [not(isCompetitionsStillOpen), withError(new Conflict('Game must be in OPEN state'))],
      [R.pipe(R.prop('schedule'), R.isEmpty), withError(new Conflict('Game must contains at least 2 competitors'))],
      [R.T, R.T],
    ])({ game, schedule });
  },
  result: async ({
    id, gid, result, status, force,
  }) => {
    const isIntegerResultFor = field => R.pipe(R.path(['result', field]), R.both(isInt, R.gte(R.__, 0)));
    const isOngoingGame = R.pathEq(['game', 'status'], 'ONGOING');
    const isRelatedGameContest = R.pathEq(['contest', 'gid'], gid);
    const isScheduledOrForceUpdate = R.either(R.prop('force'), R.pathEq(['contest', 'status'], 'SCHEDULED'));
    const isValidResult = R.both(isIntegerResultFor('visitor'), isIntegerResultFor('home'));
    const isProperFinalState = R.pipe(R.prop('status'), R.contains(R.__, ['PLAYED', 'WALKOVER']));

    const game = await games.findById(gid);
    const contest = await contests.findById({ id });

    return R.cond([
      [not(isOngoingGame), withError(new Conflict('Game must be in ONGOING state'))],
      [not(isRelatedGameContest), withError(new Conflict('Trying to update unrelated contest'))],
      [not(isScheduledOrForceUpdate), withError(new Conflict('Related contest must be in SCHEDULED state'))],
      [not(isValidResult), withError(new Conflict('Result values must be an non-negative integer'))],
      [not(isProperFinalState), withError(new Conflict('aa'))],
      [R.T, R.T],
    ])({
      game, contest, result, status, force,
    });
  },
};
