const Location = require('./location');
const Board = require('./board');

const numericalLocations = {
  '1': '0,0', '2': '1,0', '3': '2,0',
  '4': '0,1', '5': '1,1', '6': '2,1',
  '7': '0,2', '8': '1,2', '9': '2,2',
};

module.exports = class Match {
  constructor(prompt, board) {
    this._prompt = prompt;
    this._board = board;
  }

  async start() {
    this._playerIndex = 0;
    this._prompt.clear();
    
    while (!this._isOver()) {
      this._printBoard();

      try {
        const location = await this._getLocationInputFromCurrentPlayer();
        if (location == null)
          return;

        this._takeTurn(location);
        this._prompt.clear();
      } catch (e) {
        this._prompt.clear();
        this._prompt.print(`Invalid input: ${e.message}`);
      }
    }

    this._printBoard();
    this._declareWinner();
    this._playerIndex = undefined;

    await this._prompt.pause();
    return this._board.getWinner();
  }

  async _getLocationInputFromCurrentPlayer() {
    const playerChar = Board.playerChars[this._playerIndex];
    const query = `\nLocation for ${playerChar}: `;
    const input = await this._prompt.readLine(query, this._playerIndex);

    if (input == null) {
      return null;
    } else if (input in numericalLocations) {
      return Location.from(numericalLocations[input]);
    }

    return Location.from(input);
  }

  _takeTurn(location) {
    this._setForCurrentPlayer(location);
    this._printBoard();
    this._nextPlayer();
  }

  _setForCurrentPlayer(location) {
    if (this._board.isOccupiedAt(location)) {
      throw Error('Cell already occupied');
    }

    this._board.set(location, this._playerIndex);
  }

  _printBoard() {
    this._prompt.print(this._board.toString());
  }

  _nextPlayer() {
    this._playerIndex++;
    this._playerIndex %= 2;
  }

  _isOver() {
    return this._board.isFinished();
  }

  _declareWinner() {
    const winnerIndex = this._board.getWinner();

    if (winnerIndex != null) {
      const winner = Board.playerChars[winnerIndex];
      this._prompt.print(`\nMatch over, ${winner} wins`);
    } else if (this._board.isDraw()) {
      this._prompt.print('\nMatch over, draw');
    }
  }
};