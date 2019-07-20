const MultiplayerPrompt = require('../multiplayerPrompt');
const PlayerClient = require('../playerClient');
const Game = require('../game');

jest.mock('../playerClient');
jest.mock('fs');

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'log').mockImplementation();
});

test('server single match, X wins', async () => {
  const winner = await startGameWithPresetInput(
    Game.SINGLE_MATCH, 'PON', 'PTW',
    '0,0', '1,1', '1,0', '2,2', '2,0', // Match 1, X wins
  );
  expect(winner).toBe(0);
});

test('server best of 3, O wins', async () => {
  const winner = await startGameWithPresetInput(
    Game.SINGLE_MATCH, 'PON', 'PTW',
    '0,2', '0,0', '1,1', '1,0', '2,2', '2,0', // Match 1, O wins
    '2,0', '2,1', '1,1', '2,2', '0,2', // Match 2, X wins
    '1,1', '0,0', '1,2', '1,0', '2,2', '2,0' // Match 3, O wins
  );
  expect(winner).toBe(1);
});

function startGameWithPresetInput(type, player1Name, player2Name, ...input) {
  const clients = [new PlayerClient(), new PlayerClient()];
  const prompt = new MultiplayerPrompt(...clients);
  const game = new Game(prompt, type, player1Name, player2Name);

  setAlternatingInputInOrder(clients, ...input);
  return game.start();
}

function setAlternatingInputInOrder(clients, ...input) {
  const spies = clients.map(client => jest.spyOn(client, 'readLine'));
  let index = 0;

  for (let line of input) {
    spies[index].mockResolvedValueOnce(line);
    index++;
    index %= spies.length;
  }
}