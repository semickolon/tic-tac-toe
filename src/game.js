const Match = require('./match');
const Board = require('./board');
const leaderboard = require('./leaderboard');

const SCORE_PER_WIN = 10;

class Game {
  constructor(prompt, type, player1Name, player2Name) {
    this._prompt = prompt;
    this._type = type;
    this._playerNames = [player1Name, player2Name];
    this._playerWins = [0, 0];
    this._matchIndex = 0;
  }

  async start() {
    while (!this._isOver()) {
      await this._startMatch();
      this._matchIndex++;
    }

    this._addPlayerScoresToLeaderboard();
    await this._declareWinner();
    return this._getWinner();
  }

  async _startMatch() {
    await this._showPreMatchInfo();

    const board = new Board();
    const match = new Match(this._prompt, board);

    const winnerIndex = await match.start();
    if (winnerIndex != null) {
      this._playerWins[winnerIndex]++;
    }
  }

  _isOver() {
    return this._getWinner() != -1;
  }

  _addPlayerScoresToLeaderboard() {
    leaderboard.add(this._playerNames[0], this._scoreOfPlayer(0));
    leaderboard.add(this._playerNames[1], this._scoreOfPlayer(1));
  }

  _scoreOfPlayer(playerIndex) {
    return this._playerWins[playerIndex] * SCORE_PER_WIN;
  }

  _getWinner() {
    if (this._type == Game.SINGLE_MATCH) {
      return this._playerWins.indexOf(1);
    } else if (this._type == Game.BEST_OF_3) {
      return this._playerWins.indexOf(2);
    } else if (this._type == Game.BEST_OF_5) {
      return this._playerWins.indexOf(3);
    }
  }

  _scoreInfo() {
    return `Wins:
  ${this._playerNames[0]} (${Board.playerChars[0]}) - ${this._playerWins[0]}
  ${this._playerNames[1]} (${Board.playerChars[1]}) - ${this._playerWins[1]}

Scores:
  ${this._playerNames[0]} (${Board.playerChars[0]}) - ${this._scoreOfPlayer(0)}
  ${this._playerNames[1]} (${Board.playerChars[1]}) - ${this._scoreOfPlayer(1)}`;
  }

  async _showPreMatchInfo() {
    this._prompt.clear();
    this._prompt.print(`Match ${this._matchIndex + 1}\n\n${this._scoreInfo()}`);
    await this._prompt.pause();
  }

  async _declareWinner() {
    this._prompt.clear();

    this._prompt.print(`Game Over
    
${this._scoreInfo()}
    
${Board.playerChars[this._getWinner()]} wins`);

    await this._prompt.pause();
  }
};

Game.SINGLE_MATCH = 1;
Game.BEST_OF_3 = 2;
Game.BEST_OF_5 = 3;

module.exports = Game;