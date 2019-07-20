class Board {
  constructor(template) {
    this.grid = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];

    if (template != null)
      this._setGridWith(template);
  }

  _setGridWith(template) {
    const rows = template.split('\n');
    if (rows.length != 3)
      throw Error('Invalid board template, must have exactly 3 rows');

    if (rows.some(r => r.length != 3))
      throw Error('Invalid board template, all rows must be exactly of length 3');
    
    this.grid = rows.map(row => {
      return row.split('').map(c => {
        if (c == '.')
          return null;
        else if (Board.playerChars.includes(c))
          return c;
        else
          throw Error('Invalid board template, contains invalid characters');
      });
    });
  }

  get empty() {
    const rowIsEmpty = (row) => row.every(c => c === null);
    return this.grid.every(rowIsEmpty);
  }

  get full() {
    const rowIsFull = (row) => row.every(c => c != null);
    return this.grid.every(rowIsFull);
  }

  _throwIfLocationIsInvalid(location) {
    if (location.x >= 3 || location.y >= 3)
      throw Error('Out of bounds location');
  }

  set(location, playerIndex) {
    this._throwIfLocationIsInvalid(location);
    this.grid[location.y][location.x] = Board.playerChars[playerIndex];
  }

  clear(location) {
    this._throwIfLocationIsInvalid(location);
    this.set(location, null);
  }

  isOccupiedAt(location) {
    this._throwIfLocationIsInvalid(location);
    return this.grid[location.y][location.x] != null;
  }

  toString() {
    const rowToString = (row) => {
      return row.map(c => {
        return c === null ? '.' : c;
      }).join('');
    };

    return this.grid.map(rowToString).join('\n');
  }

  get _columns() {
    const cols = [];

    for (let x = 0; x < 3; x++) {
      const col = [];
      for (let y = 0; y < 3; y++) {
        col.push(this.grid[y][x]);
      }
      cols.push(col);
    }

    return cols;
  }

  get _diagonals() {
    const g = this.grid;
    return [
      [ g[0][0], g[1][1], g[2][2] ],
      [ g[2][0], g[1][1], g[0][2] ],
    ];
  }

  getWinner() {
    const groups = [this.grid, this._columns, this._diagonals];

    for (let group of groups) {
      for (let list of group) {
        for (let [i, char] of Board.playerChars.entries()) {
          if (list.every(c => c == char))
            return i;
        }
      }
    }
  }

  isDraw() {
    return this.full && this.getWinner() == null;
  }

  isFinished() {
    return this.isDraw() || this.getWinner() != null;
  }
}

Board.playerChars = ['X', 'O'];

module.exports = Board;