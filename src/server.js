const WebSocket = require('ws');
const PlayerClient = require('./playerClient');

const PLAYER_COUNT = 2;
let wss;

module.exports = {
  openThenWaitForPlayers() {
    if (wss)
      throw Error('Server is already open');

    wss = new WebSocket.Server({ port: 2323 });
    let clients = []

    return new Promise(resolve => {
      wss.on('connection', ws => {
        clients.push(new PlayerClient(ws));
        if (clients.length == PLAYER_COUNT)
          resolve(clients);
      });
    });
  },
  close() {
    if (wss) {
      wss.close();
      wss = undefined;
    }
  }
}