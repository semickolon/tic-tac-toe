class PlayerClient {
  constructor(ws) {
    this.ws = ws;
  }

  _send(json) {
    this.ws.send(JSON.stringify(json));
  }

  print(message) {
    this._send({
      command: 'print',
      message,
    });
  }

  clear() {
    this._send({ command: 'clear' });
  }

  async readLine(query) {
    return new Promise(resolve => {
      this.ws.on('message', resolve);
      this._send({
        command: 'readln',
        query,
      });
    });
  }

  async pause() {
    return new Promise(resolve => {
      this.ws.on('message', () => resolve());
      this._send({
        command: 'pause',
        duration: 5000,
      });
    });
  }
}

module.exports = PlayerClient;