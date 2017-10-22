const R = require('ramda');
const { BadRequest } = require('./exceptions');

module.exports = {
  requiredProps: (...props) => (req, res, next) => {
    const lostProps = R.lostProps(props, req.body);
    if (!R.isEmpty(lostProps)) {
      throw new BadRequest(`missing props: ${lostProps.join(',')}`);
    }
    next();
  },
};

