const R = require('../utils/rambda.extension');
const { BadRequest } = require('./exceptions');

module.exports = {
  requiredProps: (...props) => ({ body }, res, next) => {
    const lostProps = R.lostProps(props, body);
    if (!R.isEmpty(lostProps)) {
      throw new BadRequest(`missing props: ${lostProps.join(',')}`);
    }
    next();
  },
};

