const Prompt = require('./prompt');
const inquirer = require('inquirer');

jest.mock('inquirer');

beforeEach(() => {
  inquirer.prompt.mockReset();
});

test('delegates to console.log on printing and adds it to contents', () => {
  const prompt = new Prompt();
  jest.spyOn(console, 'log').mockImplementation();

  prompt.print('Hello, world');
  prompt.print('2001: A Space Odyssey');

  expect(console.log).toHaveBeenNthCalledWith(1, 'Hello, world');
  expect(console.log).toHaveBeenNthCalledWith(2, '2001: A Space Odyssey');

  expect(prompt.contents).toEqual([
    'Hello, world',
    '2001: A Space Odyssey',
  ]);

  console.log.mockRestore();
});

test('delegates to inquirer.prompt for reading console line input', async () => {
  const prompt = new Prompt();
  inquirer.prompt
    .mockResolvedValueOnce({ data: 'Damn laki' })
    .mockResolvedValueOnce({ data: 'Emma' });
  
  expect(await prompt.readLine('Boi')).toBe('Damn laki');
  expect(await prompt.readLine('Whomstve? ')).toBe('Emma');

  expect(inquirer.prompt).toHaveBeenNthCalledWith(1, [{
    type: 'input',
    name: 'data',
    message: 'Boi'
  }]);
  
  expect(inquirer.prompt).toHaveBeenNthCalledWith(2, [{
    type: 'input',
    name: 'data',
    message: 'Whomstve? '
  }]);
});

test('delegates to inquirer.prompt for singular list choice', async () => {
  const prompt = new Prompt();
  inquirer.prompt.mockResolvedValueOnce({ data: 'Detergent' });

  const selected = await prompt.selectOneFrom(
    'Fave food?', 'Pizza', 'Hamburger', 'Detergent'
  );
  
  expect(selected).toBe('Detergent');
  expect(inquirer.prompt).toHaveBeenCalledWith([
    expect.objectContaining({
      type: 'list',
      name: 'data',
      message: 'Fave food?',
      choices: ['Pizza', 'Hamburger', 'Detergent']
    })
  ]);
});
