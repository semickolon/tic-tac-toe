const Board = require('./board');
const Location = require('./location');

function loc(x, y) {
  return new Location(x, y);
}

test('empty board is created if no template is given', () => {
  expect(new Board().empty).toBe(true);
});

test('empty board has no occupied cell', () => {
  const board = new Board();
  expect(board.isOccupiedAt(loc(0, 0))).toBe(false);
  expect(board.isOccupiedAt(loc(1, 1))).toBe(false);
  expect(board.isOccupiedAt(loc(2, 0))).toBe(false);
});

test('board with template on construction can match itself', () => {
  expect(new Board('...\nX..\nO..').toString()).toBe('...\nX..\nO..');
  expect(new Board('.OO\nXOX\n.X.').toString()).toBe('.OO\nXOX\n.X.');
  expect(new Board('...\n...\n...').toString()).toBe('...\n...\n...');
});

test('board with nonempty template on construction is not empty', () => {
  expect(new Board('...\n...\n...').empty).toBe(true);
  expect(new Board('...\n...\n.O.').empty).toBe(false);
});

test('throws if board template does not have exactly 3 rows', () => {
  expect(() => new Board('')).toThrow();
  expect(() => new Board('kek')).toThrow();
  expect(() => new Board('a\nb\nc\nd')).toThrow();
});

test('throws if board template has rows of invalid length', () => {
  expect(() => new Board('ABCD\nDE\n123324')).toThrow();
  expect(() => new Board('..\n.X.\n..O')).toThrow();
})

test('throws if board template contains invalid chars', () => {
  expect(() => new Board('.X.\n.O.\n..J')).toThrow();
  expect(() => new Board('...\n?>.\n.X.')).toThrow();
});

test('can set and clear a cell', () => {
  let board = new Board();
  board.set(loc(2, 1), 0);
  expect(board.isOccupiedAt(loc(2, 1))).toBe(true);
  board.clear(loc(2, 1));
  expect(board.isOccupiedAt(loc(2, 1))).toBe(false);
});

test('throws if location used is out of bounds', () => {
  let board = new Board();
  expect(() => board.isOccupiedAt(loc(3, 0))).toThrow();
  expect(() => board.clear(loc(0, 3))).toThrow();
  expect(() => board.set(loc(4, 3), 0)).toThrow();
});

test('has winner if row is occupied by player', () =>{
  expect(new Board('XXX\n...\nOXO').getWinner()).toBe(0);
  expect(new Board('.X.\nOOO\n.XX').getWinner()).toBe(1);
  expect(new Board('...\n...\nXXX').getWinner()).toBe(0);
});

test('has winner if column is occupied by player', () => {
  expect(new Board('O..\nO.X\nO.X').getWinner()).toBe(1);
  expect(new Board('XO.\n.O.\nOOX').getWinner()).toBe(1);
  expect(new Board('..X\n..X\n..X').getWinner()).toBe(0);
});

test('has winner if diagonal is occupied by player', () => {
  expect(new Board('O..\n.OO\nXXO').getWinner()).toBe(1);
  expect(new Board('XOX\nOXO\nXOO').getWinner()).toBe(0);
});

test('has no winner if no winning conditions are met', () => {
  expect(new Board().getWinner()).toBeUndefined();
  expect(new Board('.X.\n.OO\nXXO').getWinner()).toBeUndefined();
});

test('draw if all cells are occupied and has no winner', () => {
  expect(new Board('XOO\nOXX\nXOO').isDraw()).toBe(true);
  expect(new Board('OOO\nOXX\nXXO').isDraw()).toBe(false);

  expect(new Board('...\n.X.\n...').isDraw()).toBe(false);
  expect(new Board('...\n.X.\n...').getWinner()).toBeUndefined();
});

test('is finished if draw or has winner', () => {
  expect(new Board('XXX\n...\nOXO').isFinished()).toBe(true);
  expect(new Board('.X.\n...\n..X').isFinished()).toBe(false);
  expect(new Board('XXO\nOOX\nXOX').isFinished()).toBe(true);
});