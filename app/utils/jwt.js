const jwt = require('jsonwebtoken');
const config = require('../config')();

const { users, level } = require('../services');

const template = token => `
  <html>
    <head>
      <title>JWT Token</title>
      <script>
        window.addEventListener('message', (event) => {
          if (event.data == 'ready?') {
            event.source.postMessage({jwt: '${token}'},'*');
            window.close();
          }
        });
      </script>
    </head>
  </html>
`;
const auth = (req, res) => {
  if (req.user) {
    const token = jwt.sign(req.user, config.get('JWT_SECRET'), {
      issuer: 'Premiersted', expiresIn: '7 days',
    });
    res.send(template(token));
  }
};

const protect = (req, res, next) => {
  const token = req.headers['auth-token'];
  if (token) {
    jwt.verify(token, config.get('JWT_SECRET'), {}, (err, decoded) => {
      if (err) {
        res.status(401).send(`Unauthorized: ${err.message}`);
        return;
      }
      console.log(decoded);
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).send('Unauthorized: no token provided');
  }
};

const protectLevel = requestedLevel => (req, res, next) => {
  protect(req, res, () => {
    users.getAccess(req.user)
      .then((userLevel) => {
        if (level.atLeast(userLevel, requestedLevel)) {
          next();
        } else {
          res.status(403).send(`Forbidden: insufficient permissions ${userLevel}, needs ${requestedLevel}`);
        }
      })
      .catch((e) => {
        console.error(e);
        res.status(500).send('Internal Server Error');
      });
  });
};
module.exports = {
  auth, protect, protectLevel,
};
