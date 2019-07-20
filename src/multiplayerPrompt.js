const Prompt = require('./prompt');

const ALL = -1;

module.exports = class MultiplayerPrompt extends Prompt {
  constructor(...clients) {
    super();
    this.clients = clients;
  }

  _doForTarget(target, cb) {
    if (target === ALL) {
      this.clients.forEach(cb);
    } else {
      const client = this.clients[target];
      if (client)
        cb(client);
    }
  }

  print(message, target = ALL) {
    this._doForTarget(target, c => c.print(message));
  }

  clear(target = ALL) {
    this._doForTarget(target, c => c.clear());
  }

  async pause() {
    await Promise.all(this.clients.map(c => c.pause()));
  }

  async readLine(query, target) {
    return await this.readLineWithValidator(query, null, target);
  }

  async readLineWithValidator(query, validator, target) {
    const client = this.clients[target];
    if (client == null)
      return;

    let input = await client.readLine(query);
    if (validator == null)
      return input;

    let validationResult = validator(input);

    while (validationResult !== true) {
      if (typeof validationResult == 'string')
        client.print(validationResult);

      input = await client.readLine(query);
      validationResult = validator(input);
    }

    return input;
  }
};
