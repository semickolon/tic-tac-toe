const Game = require('./game');
const Prompt = require('./prompt');
const Interactor = require('./interactor');
const leaderboard = require('./leaderboard');

const MultiplayerPrompt = require('./multiplayerPrompt');
const server = require('./server');

const TUTORIAL = `
The object of Tic Tac Toe is to get three in a row. You play on a three by three game board. 
The first player is known as X and the second is O. Players alternate placing Xs and Os on the
game board until either oppent has three in a row or all nine squares are filled. X always 
goes first, and in the event that no one has three in a row, the stalemate is called a cat game.
`;

async function startLocalGame(prompt) {
  const selectedType = await selectGameType(prompt);
  if (selectedType == null)
    return;

  const playerNames = await requestPlayerNames(prompt);
  const game = new Game(prompt, selectedType, ...playerNames);
  await game.start();
}

async function startServerGame(prompt) {
  const selectedType = await selectGameType(prompt);
  if (selectedType == null)
    return;

  prompt.clear();
  prompt.print('Waiting for players...');
  const clients = await server.openThenWaitForPlayers();
  prompt.print('All players connected...');

  const mpPrompt = new MultiplayerPrompt(...clients);
  const playerNames = await requestPlayerNames(mpPrompt);
  const game = new Game(mpPrompt, selectedType, ...playerNames);

  prompt.print('Game starting...');
  await game.start();

  server.close();
}

async function selectGameType(prompt) {
  prompt.clear();
  const gameTypes = {
    'Single': Game.SINGLE_MATCH,
    'Best of 3': Game.BEST_OF_3,
    'Best of 5': Game.BEST_OF_5,
    'Back': null,
  };
  const typeKey = await prompt.selectOneFrom(
    'Select game type', ...Object.keys(gameTypes)
  );
  return gameTypes[typeKey];
}

async function requestPlayerNames(prompt) {
  const nameValidator = input => 
    /^[A-Z]{3}$/g.test(input) ? true : 'Must be three capital letters (FBR)';
  let player1Name, player2Name;

  while (true) {
    player1Name = await prompt.readLineWithValidator('Player 1 name: ', nameValidator, 0);
    player2Name = await prompt.readLineWithValidator('Player 2 name: ', nameValidator, 1);

    if (player1Name == player2Name) {
      prompt.clear();
      prompt.print('Names must be different');
    } else {
      break;
    }
  }

  return [player1Name, player2Name];
}

async function printLeaderboard(prompt) {
  prompt.clear();
  prompt.print('Leaderboard\n');

  const scores = leaderboard.getHighScores(10);

  if (scores.length > 0) {
    const scoresStr = scores.map(
      ([name, score], i) => `${i+1}. ${name} - ${score}`
    ).join('\n');
  
    prompt.print(scoresStr);
  } else {
    prompt.print('No scores yet');
  }

  await prompt.pause();
}

async function main() {
  const prompt = new Prompt();
  const interactor = new Interactor(prompt, 'main', {
    main: {
      title: 'Tic Tac Toe',
      description: 'Welcome to a game that coding tutorials rave',
      choices: {
        'Begin Game': 'game',
        'How to Play': 'tutorial',
        'Leaderboard': 'leaderboard',
      }
    },
    'game': {
      title: 'Game Mode',
      description: 'A very challenging game is coming your way',
      choices: {
        'Local': 'local',
        'Multiplayer': 'server',
      },
    },
    'local': startLocalGame,
    'server': startServerGame,
    'tutorial': {
      title: 'How to Play',
      description: TUTORIAL
    },
    'leaderboard': printLeaderboard,
  });

  await interactor.start();
}

main();