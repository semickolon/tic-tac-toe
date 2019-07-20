let winnersByMatch = [];
jest.doMock('./match', () => class {
  async start() {
    return winnersByMatch.shift();
  }
});

const Game = require('./game');
const Prompt = require('./prompt');
const leaderboard = require('./leaderboard');

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
  leaderboard.clear();
  // Prevent console logging and pausing
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(Prompt.prototype, 'pause').mockImplementation(() => {});
});

test('single match, O wins', async () => {
  const game = createGame(Game.SINGLE_MATCH, 'ABC', 'XYZ');

  const winner = await startGameWithMatchWinners(game, 1);

  expect(winner).toBe(1);
  expect(leaderboard.getHighScores()).toStrictEqual([
    ["XYZ", 10],
  ]);
});

test('best of 3, 3 matches, X wins', async () => {
  const game = createGame(Game.BEST_OF_3, 'JAK', 'DAX');

  const winner = await startGameWithMatchWinners(game, 0, 1, 0);

  expect(winner).toBe(0);
  expect(leaderboard.getHighScores()).toStrictEqual([
    ["JAK", 20], ["DAX", 10]
  ]);
});

test('best of 3, 2 matches, O wins', async () => {
  const game = createGame(Game.BEST_OF_3, 'JAK', 'DAX');

  const winner = await startGameWithMatchWinners(game, 1, 1);

  expect(winner).toBe(1);
  expect(leaderboard.getHighScores()).toStrictEqual([
    ["DAX", 20],
  ]);
});

test('best of 5 , 4 matches, X wins', async () => {
  const game = createGame(Game.BEST_OF_5, 'BOI', 'GRL');

  const winner = await startGameWithMatchWinners(game, 0, 1, 0, 0);

  expect(winner).toBe(0);
  expect(leaderboard.getHighScores()).toStrictEqual([
    ["BOI", 30], ["GRL", 10]
  ]);
});

test('best of 5, 5 matches, O wins', async () => {
  const game = createGame(Game.BEST_OF_5, 'BOI', 'GRL');

  const winner = await startGameWithMatchWinners(game, 1, 0, 1, 0, 1);

  expect(winner).toBe(1);
  expect(leaderboard.getHighScores()).toStrictEqual([
    ["GRL", 30], ["BOI", 20],
  ]);
});

test('best of 5, 7 matches, 2 draws, X wins', async () => {
  const game = createGame(Game.BEST_OF_5, 'AGK', 'LMO');

  const winner = await startGameWithMatchWinners(
    game, undefined, 1, 0, 1, undefined, 0, 0
  );

  expect(winner).toBe(0);
  expect(leaderboard.getHighScores()).toStrictEqual([
    ["AGK", 30], ["LMO", 20],
  ]);
});

function createGame(type, player1Name, player2Name) {
  return new Game(new Prompt(), type, player1Name, player2Name);
}

function startGameWithMatchWinners(game, ...winners) {
  winnersByMatch = winners;
  return game.start();
}