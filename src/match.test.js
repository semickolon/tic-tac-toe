const Match = require('./match');
const Prompt = require('./prompt');
const Board = require('./board');

let prompt, board, match;

beforeEach(() => {
  prompt = new Prompt();
  board = new Board();
  match = new Match(prompt, board);

  // Prevent console logging and pausing
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(prompt, 'pause').mockImplementation();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('declares winner X upon winning', async () => {
  board = new Board('X.X\n.O.\n.O.');
  match = new Match(prompt, board);
  setPromptInputInOrder('1,0');

  const winner = await match.start();

  expect(winner).toBe(0);
  expectToHavePrinted(
    'X.X\n.O.\n.O.',
    'XXX\n.O.\n.O.',
    /X wins/gi,
  );
});

test('declares winner O upon winning', async () => {
  board = new Board('..O\n.O.\n..X');
  match = new Match(prompt, board);
  setPromptInputInOrder('1,2', '0,2');

  const winner = await match.start();

  expect(winner).toBe(1);
  expectToHavePrinted(
    '..O\n.O.\n..X',
    '..O\n.O.\n.XX',
    '..O\n.O.\nOXX',
    /O wins/gi,
  );
});

test('declares draw upon having draw match', async () => {
  board = new Board('OX.\nXO.\nXOX');
  match = new Match(prompt, board);
  setPromptInputInOrder('2,0', '2,1');

  const winner = await match.start();

  expect(winner).toBeUndefined();
  expectToHavePrinted(
    'OX.\nXO.\nXOX',
    'OXX\nXO.\nXOX',
    'OXX\nXOO\nXOX',
    /draw/gi,
  );
});

test('retries input request if requested cell is occupied', async () => {
  setPromptInputInOrder('1,1', '1,1', '2,2', '2,2', null);

  const winner = await match.start();

  expect(winner).toBeUndefined();
  expectToHavePrinted(
    '...\n...\n...',
    '...\n.X.\n...',
    /occupied/gi,
    '...\n.X.\n..O',
    /occupied/gi,
  );
});

test('retries input request if input was invalid', async () => {
  const input = [
    '3,0', '5,6', '-2,-5', '', '  \t \t ', 
    '1,2,1', '2,', 'bc,?1', null
  ];
  setPromptInputInOrder(...input);

  const winner = await match.start();

  const invalidForAllInput = Array.from({ 
    length: input.length - 1 
  }, () => /invalid/gi);
  expectToHavePrinted(...invalidForAllInput);
  expect(winner).toBeUndefined();
});

test('full match starting from empty board where X wins', async () => {
  setPromptInputInOrder('0,0', '1,1', '1,0', '2,2', '2,0');

  const winner = await match.start();

  expect(winner).toBe(0);
  expectToHavePrinted(
    '...\n...\n...',
    'X..\n...\n...',
    'X..\n.O.\n...',
    'XX.\n.O.\n...',
    'XX.\n.O.\n..O',
    'XXX\n.O.\n..O',
    /X wins/gi,
  );
});

test('numerical input is translated to xy-location', async () => {
  setPromptInputInOrder('1', '5', '9', null);

  const winner = await match.start();

  expect(winner).toBeUndefined();
  expectToHavePrinted(
    '...\n...\n...',
    'X..\n...\n...',
    'X..\n.O.\n...',
    'X..\n.O.\n..X',
  );
});

test('request input with current player index for multiplayer support', async () => {
  setPromptInputInOrder('0,0', '1,0', '2,1', null);

  const winner = await match.start();

  expect(winner).toBeUndefined();
  expect(prompt.readLine).toHaveBeenNthCalledWith(1, expect.any(String), 0);
  expect(prompt.readLine).toHaveBeenNthCalledWith(2, expect.any(String), 1);
  expect(prompt.readLine).toHaveBeenNthCalledWith(3, expect.any(String), 0);
});

function setPromptInputInOrder(...input) {
  const readLineSpy = jest.spyOn(prompt, 'readLine');
  return input.reduce((readLine, line) => {
    return readLine.mockResolvedValueOnce(line);
  }, readLineSpy);
}

function expectToHavePrinted(...matchers) {
  let j = 0;

  for (let str of prompt.contents) {
    const matcher = matchers[j];
    let found = false;

    if (matcher instanceof RegExp) {
      found = matcher.test(str);
    } else if (typeof matcher == 'string') {
      found = str == matcher;
    }

    if (found)
      j++;
  }

  const foundAllInOrder = j == matchers.length;
  expect(foundAllInOrder).toBe(true);
}
