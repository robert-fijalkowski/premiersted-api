const config = require('./config')();
const app = require('./app');

app.use((req, res, next) => {
  if (!req.timedout) next();
});

app.listen(config.get('PORT'), () => {
  console.log(`now listening at ${config.get('PORT')}`);
});
