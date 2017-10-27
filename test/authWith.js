const R = require('ramda');

module.exports = R.curry((request, token) => ({
  post: (url = '', data = {}) => request.post(url).set('auth-token', token).send(data),
  put: (url = '', data = {}) => request.put(url).set('auth-token', token).send(data),
  delete: (url = '', data = {}) => request.delete(url).set('auth-token', token).send(data),
  get: (url = '') => request.get(url).set('auth-token', token),
}));
