const wait = require('./wait');

module.exports = class MessageProcessor {
  constructor(prompt) {
    this.prompt = prompt;
  }

  async consume(data) {
    const { command } = data;

    switch (command) {
      case 'clear':
        this.prompt.clear();
        break;
      case 'pause':
        const { duration = 0 } = data;
        await wait(duration);
        return 'pause_finished';
      case 'readln':
        const { query } = data;
        if (typeof query == 'string')
          return this.prompt.readLine(query);
        break;
      case 'print':
        const { message } = data;
        if (typeof message == 'string')
          this.prompt.print(message);
        break;
    }
  }
}