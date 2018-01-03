/* eslint-disable no-param-reassign */
function heartbeat() {
  this.isAlive = true;
}

module.exports = (wss) => {
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping('', false, true);
      return false;
    });
  }, 15000);
  return interval;
};

