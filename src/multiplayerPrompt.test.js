const MultiplayerPrompt = require('./multiplayerPrompt');
const PlayerClient = require('./playerClient');

beforeEach(() => {
  jest.resetAllMocks();
});

test('reading input delegates to targeted client', async () => {
  const clients = generateClients(3);
  const prompt = new MultiplayerPrompt(...clients);
  jest.spyOn(clients[0], 'readLine').mockResolvedValue('from 0');
  jest.spyOn(clients[1], 'readLine').mockResolvedValue('from 1');
  jest.spyOn(clients[2], 'readLine')
    .mockResolvedValueOnce('from 2 1')
    .mockResolvedValueOnce('from 2 2');

  expect(await prompt.readLine('for 0', 0)).toBe('from 0');
  expect(await prompt.readLine('for 1', 1)).toBe('from 1');
  expect(await prompt.readLine('for 2', 2)).toBe('from 2 1');
  expect(await prompt.readLine('for 2', 2)).toBe('from 2 2');
});

test('reading input returns undefined if targeted client is invalid', async () => {
  const prompt = new MultiplayerPrompt();
  const input = await prompt.readLine('Sup? ', 9);
  expect(input).toBeUndefined();
})

test('reading input with validator delegates to targeted client', async () => {
  const [client1, client2] = generateClients(2);
  const prompt = new MultiplayerPrompt(client1, client2);
  const mustBeLongerThan3Chars = input =>
    input.length > 3 ? true : 'Must be longer than 3 chars';

  jest.spyOn(client2, 'readLine')
    .mockResolvedValueOnce('abc')
    .mockResolvedValueOnce('HAhak123');
  jest.spyOn(client2, 'print')
    .mockImplementation();

  const input = await prompt.readLineWithValidator('Q', mustBeLongerThan3Chars, 1);

  expect(input).toBe('HAhak123');
  expect(client2.print).toHaveBeenCalledWith('Must be longer than 3 chars');
});

test('printing output delegates to all clients if given no target', () => {
  const [client1, client2] = generateClients(2);
  const prompt = new MultiplayerPrompt(client1, client2);
  jest.spyOn(client1, 'print').mockImplementation();
  jest.spyOn(client2, 'print').mockImplementation();

  prompt.print('Hello');
  prompt.print('World');

  expect(client1.print).toHaveBeenNthCalledWith(1, 'Hello');
  expect(client2.print).toHaveBeenNthCalledWith(1, 'Hello');
  expect(client1.print).toHaveBeenNthCalledWith(2, 'World');
  expect(client2.print).toHaveBeenNthCalledWith(2, 'World');
});

test('printing output delegates to targeted client', async () => {
  const [client1, client2] = generateClients(2);
  const prompt = new MultiplayerPrompt(client1, client2);
  jest.spyOn(client1, 'print').mockImplementation();
  jest.spyOn(client2, 'print').mockImplementation();

  prompt.print('For 1', 0);
  prompt.print('For 2', 1);

  expect(client1.print).toHaveBeenCalledTimes(1);
  expect(client2.print).toHaveBeenCalledTimes(1);
  expect(client1.print).toHaveBeenCalledWith('For 1');
  expect(client2.print).toHaveBeenCalledWith('For 2');
});

test('clear output delegates to all clients if given no target', () => {
  const [client1, client2] = generateClients(2);
  const prompt = new MultiplayerPrompt(client1, client2);
  jest.spyOn(client1, 'clear').mockImplementation();
  jest.spyOn(client2, 'clear').mockImplementation();

  prompt.clear();

  expect(client1.clear).toHaveBeenCalledTimes(1);
  expect(client2.clear).toHaveBeenCalledTimes(1);
});

test('clear output delegates to targeted client', () => {
  const clients = generateClients(3);
  const prompt = new MultiplayerPrompt(...clients);
  jest.spyOn(clients[0], 'clear').mockImplementation();
  jest.spyOn(clients[1], 'clear').mockImplementation();
  jest.spyOn(clients[2], 'clear').mockImplementation();

  prompt.clear(0);
  prompt.clear(2);

  expect(clients[0].clear).toHaveBeenCalledTimes(1);
  expect(clients[1].clear).not.toHaveBeenCalled();
  expect(clients[2].clear).toHaveBeenCalledTimes(1);
});

test('pause delegates to all clients', async () => {
  const clients = generateClients(2);
  const prompt = new MultiplayerPrompt(...clients);
  jest.spyOn(clients[0], 'pause').mockResolvedValue();
  jest.spyOn(clients[1], 'pause').mockResolvedValue();

  await prompt.pause();

  expect(clients[0].pause).toHaveBeenCalledTimes(1);
  expect(clients[1].pause).toHaveBeenCalledTimes(1);
});

function generateClients(length) {
  return Array.from({ length }, () => new PlayerClient());
}