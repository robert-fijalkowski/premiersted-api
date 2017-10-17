/* eslint-env jest */

const { atLeast } = require('./index');

describe('level testing', () => {
  const passablePairs = [
    ['NONE', 'NONE'],
    ['USER', 'USER'],
    ['ADMIN', 'USER'],
    ['ADMIN', 'ADMIN'],
    ['ADMIN', 'INVALID'],
  ];

  passablePairs.map(([userLevel, requestedLevel]) =>
    it(`should pass level ${userLevel} to restricted ${requestedLevel}`, () => {
      expect(atLeast(userLevel, requestedLevel)).toBeTruthy();
    }));

  const notPassablePairs = [
    ['NONE', 'USER'],
    ['NONE', 'ADMIN'],
    ['USER', 'ADMIN'],
    ['NONE', 'INVALID'], // threat invalid as ADMIN
  ];

  notPassablePairs.map(([userLevel, requestedLevel]) =>
    it(`should not pass level ${userLevel} to restricted ${requestedLevel}`, () => {
      expect(atLeast(userLevel, requestedLevel)).toBeFalsy();
    }));
});
