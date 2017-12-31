const { users } = require('../../db');
const jwt = require('../../utils/jwt');

module.exports = {
  async exchange(user) {
    return {
      token: jwt.getToken({ user: await users.findById(user.id) }),
    };
  },
};

