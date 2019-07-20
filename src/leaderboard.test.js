let readFileSyncReturn = '{}';
jest.doMock('fs', () => ({
  readFileSync: jest.fn()
    .mockImplementation(() => readFileSyncReturn),
  writeFileSync: jest.fn(),
}));

const leaderboard = require('./leaderboard');
const fs = require('fs');

beforeEach(() => {
  readFileSyncReturn = '{}';
  leaderboard.clear();
  fs.readFileSync.mockClear();
  fs.writeFileSync.mockClear();
});

test('adds scores and retrieves top N scores', () => {
  leaderboard.add('INF', 10);
  leaderboard.add('REX', 20);
  leaderboard.add('AGK', 16);

  expect(leaderboard.getHighScores()).toStrictEqual([
    ['REX', 20], ['AGK', 16], ['INF', 10],
  ]);
  expect(leaderboard.getHighScores(2)).toStrictEqual([
    ['REX', 20], ['AGK', 16],
  ]);
});

test('increments scores for existing names', () => {
  leaderboard.add('ALY', 5);
  leaderboard.add('MOI', 2);
  leaderboard.add('ALY', 15);
  leaderboard.add('MOI', 4);
  leaderboard.add('AQU', 23);

  expect(leaderboard.getHighScores(10)).toStrictEqual([
    ['AQU', 23], ['ALY', 20], ['MOI', 6]
  ]);
});

test('adding 0 as score has no effect in scores and local file', () => {
  leaderboard.add('ABC', 0);
  leaderboard.add('DEF', 1);

  expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(leaderboard.getHighScores(3)).toStrictEqual([
    ['DEF', 1]
  ]);
});

test('adding negative score throws error and has no effect in local file', () => {
  expect(() => leaderboard.add('JKL', -1)).toThrow();
  expect(() => leaderboard.add('XPO', -4392)).toThrow();
  expect(fs.writeFileSync).not.toHaveBeenCalled();
})

test('clears all scores', () => {
  leaderboard.add('RMV', 10);
  leaderboard.add('KEK', 32194);
  leaderboard.clear();

  expect(leaderboard.getHighScores()).toHaveLength
});

test('reads from local file', () => {
  readFileSyncReturn = `{"PWT":90}`;
  leaderboard.read();

  expect(leaderboard.getHighScores()).toStrictEqual([ 
    ['PWT', 90] 
  ]);
  expect(fs.readFileSync).toHaveBeenCalledTimes(1);
});

test('saves to local file', () => {
  leaderboard.add('MER', 99909);
  leaderboard.add('AGK', 99);

  expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
});

test('fallback to empty scores if no local file exists', () => {
  const original = fs.readFileSync;
  fs.readFileSync.mockImplementation(() => {
    throw Error('File not found')
  });

  leaderboard.read();

  expect(leaderboard.getHighScores()).toHaveLength(0);
  fs.readFileSync = original;
});