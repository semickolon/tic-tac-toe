const { prompt } = require('inquirer');

module.exports = class Prompt {
  constructor() {
    this._contents = [];
  }

  print(str) {
    console.log(str);
    this._contents.push(str);
  }

  clear() {
    process.stdout.write("\u001b[2J\u001b[0;0H");
  }

  pause(message) {
    if (message)
      console.log(message);

    process.stdin.setRawMode(true);
    process.stdin.resume();

    return new Promise(resolve => {
      process.stdin.on('data', resolve);
    });
  }

  async readLine(query) {
    return this.readLineWithValidator(query);
  }

  async readLineWithValidator(query, validator) {
    const { data: input } = await prompt([{
      type: 'input',
      name: 'data',
      message: query,
      validate: validator,
    }]);
    return input;
  }

  async selectOneFrom(query, ...choices) {
    const { data: chosen } = await prompt([{
      type: 'list',
      name: 'data',
      message: query,
      choices,
    }]);
    return chosen;
  }

  get contents() {
    return this._contents;
  }
};