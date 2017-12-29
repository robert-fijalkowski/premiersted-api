const config = require('./config')();
const appF = require('./app');
const morgan = require('morgan');

morgan.token('userId', req => (req.user || {}).id || 'N/A');
const app = appF(morgan(
  ':method status=:status url=:url user=:userId time=:response-time bytes=:res[content-length] ref=":referrer" UA=":user-agent"',
  { skip(req) { return req.method === 'OPTIONS'; } },
));

app.use((req, res, next) => {
  if (!req.timedout) next();
});

app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
