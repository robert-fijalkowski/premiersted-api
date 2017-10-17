const levels = ['NONE', 'USER', 'ADMIN'];

module.exports = {
  atLeast(userLevel, requestedLevel) {
    const requestedLevelIndex =
    levels.indexOf(requestedLevel) !== -1
      ? levels.indexOf(requestedLevel)
      : levels.indexOf('ADMIN');
    return levels.indexOf(userLevel) >= requestedLevelIndex;
  },
};

