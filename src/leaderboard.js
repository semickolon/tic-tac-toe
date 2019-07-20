const fs = require('fs');
const path = require('path');

const scoresPath = path.resolve(__dirname, 'game_data/leaderboard.json');
let scores = {};

function add(name, score) {
  if (score < 0) {
    throw Error('Negative score not allowed');
  }

  if (name in scores) {
    scores[name] += score;
  } else if (score != 0) {
    scores[name] = score;
  } else {
    return;
  }

  commit();
}

function commit() {
  fs.writeFileSync(scoresPath, JSON.stringify(scores));
}

function getHighScores(maxCount) {
  let sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (maxCount != null)
    sortedScores = sortedScores.slice(0, maxCount);
  return sortedScores;
}

function clear() {
  scores = {};
  commit();
}

function read() {
  try {
    scores = JSON.parse(fs.readFileSync(scoresPath));
  } catch (e) {
    scores = {};
  }
}

module.exports = {
  add, getHighScores, clear, read
};

read();