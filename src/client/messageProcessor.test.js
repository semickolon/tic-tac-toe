const MessageProcessor = require('./messageProcessor');
const Prompt = require('../prompt');
const wait = require('./wait');

jest.mock('../prompt');
jest.mock('./wait', () => jest.fn());

beforeEach(() => {
  jest.resetAllMocks();
});

test('clears prompt', async () => {
  const prompt = new Prompt();
  const processor = new MessageProcessor(prompt);

  const reply = await processor.consume({
    command: 'clear'
  });

  expect(reply).toBeUndefined();
  expect(prompt.clear).toHaveBeenCalledTimes(1);
});

test('pauses for specified duration and returns reply', async () => {
  const prompt = new Prompt();
  const processor = new MessageProcessor(prompt);

  const reply = await processor.consume({
    command: 'pause',
    duration: 20349
  });

  expect(reply).toEqual(expect.any(String));
  expect(wait).toHaveBeenCalledWith(20349);
});

test('prints specified message to prompt', async () => {
  const prompt = new Prompt();
  const processor = new MessageProcessor(prompt);

  const reply = await processor.consume({
    command: 'print',
    message: 'Magnafanta Computer',
  });

  expect(reply).toBeUndefined();
  expect(prompt.print).toHaveBeenCalledWith('Magnafanta Computer');
});

test('reads line with specified query from prompt', async () => {
  const prompt = new Prompt();
  const processor = new MessageProcessor(prompt);
  prompt.readLine.mockResolvedValueOnce('Storm Area 51');

  const reply = await processor.consume({
    command: 'readln',
    query: 'Sept. 20 means? ',
  });

  expect(reply).toBe('Storm Area 51');
  expect(prompt.readLine).toHaveBeenCalledWith('Sept. 20 means? ');
});
