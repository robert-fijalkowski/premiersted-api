const randomatic = require('randomatic');
const { accounts } = require('../../db');
const { Conflict } = require('../../router/exceptions');

module.exports = {
  async findOrCreateNew(providerId) {
    const id = await accounts.findByProviderId(providerId);
    if (!id) {
      const newId = `l:${randomatic('Aa0', 6)}`;
      return (await accounts.add({ id: newId, providerId })).id;
    }
    return id;
  },
  async connectToExisting({ providerId, id }) {
    const providers = await accounts.findById(id);
    if (providers.length === 0) {
      throw new Conflict(`${id} has no connections`);
    }
    return accounts.add({ providerId, id });
  },
  async findAll(id) {
    return accounts.findById(id);
  },
  async forgot(id) {
    // todo
  },
  async detach(providerId) {
    // todo
  },
};

