
module.exports = (app) => {
  let currentRes;

  app.use((req, res, next) => {
    currentRes = res;
    next();
  });

  process.on('uncaughtException', (e) => {
    console.log(e);
  });

  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
    currentRes.status(500).send('Internal Server Exception');
  });
};
