import { initSwipe } from "../common/swipe.js";
import {
  saveGameState,
  loadGameState,
  hasGameState,
  clearGameState,
} from "../common/gameStorage.js";

let gameState = {
  board: [],
  score: 0,
  target: 2048,
  targetReached: false,
  gameOver: false,
};

const GAME_ID = "2048";
const gameBoard = document.getElementById("gameBoard");
const scoreElement = document.getElementById("score");
const newGameButton = document.getElementById("newGame");
const gameMessage = document.getElementById("gameMessage");

function newGame() {
  clearGameState(GAME_ID);
  gameState.board = createEmptyBoard();
  gameState.score = 0;
  gameState.targetReached = false;
  gameState.gameOver = false;

  gameMessage.innerHTML = "";
  addRandomTile();
  addRandomTile();

  render();
  newGameButton.blur();
}

function addRandomTile() {
  const emptyCells = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (gameState.board[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) {
    return false;
  }

  const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  const value = Math.random() < 0.9 ? 2 : 4;

  gameState.board[cell.row][cell.col] = value;

  return true;
}

function createEmptyBoard() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function render() {
  gameBoard.innerHTML = "";

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const value = gameState.board[row][col];

      const cell = document.createElement("div");
      cell.classList.add("game__cell");

      if (value !== 0) {
        cell.textContent = value;
        cell.classList.add(`game__cell--${value}`);
      }

      gameBoard.appendChild(cell);
    }
  }

  scoreElement.textContent = gameState.score;
}

function moveLine(line) {
  // Прибираємо порожні клітинки
  const tiles = line.filter((value) => value !== 0);

  const result = [];
  let scoreGained = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      const mergedValue = tiles[i] * 2;

      result.push(mergedValue);
      scoreGained += mergedValue;

      i++;
    } else {
      result.push(tiles[i]);
    }
  }

  // Доповнюємо рядок нулями
  while (result.length < 4) {
    result.push(0);
  }

  return {
    line: result,
    scoreGained,
  };
}

function move(direction) {
  let changed = false;
  let scoreGained = 0;
  if (gameState.gameOver) {
    return;
  }

  if (direction === "left" || direction === "right") {
    for (let row = 0; row < 4; row++) {
      let line = [...gameState.board[row]];

      if (direction === "right") {
        line.reverse();
      }

      const result = moveLine(line);

      if (direction === "right") {
        result.line.reverse();
      }

      if (
        JSON.stringify(gameState.board[row]) !== JSON.stringify(result.line)
      ) {
        changed = true;
      }

      gameState.board[row] = result.line;
      scoreGained += result.scoreGained;
    }
  }

  if (direction === "up" || direction === "down") {
    for (let col = 0; col < 4; col++) {
      let line = [];

      for (let row = 0; row < 4; row++) {
        line.push(gameState.board[row][col]);
      }

      if (direction === "down") {
        line.reverse();
      }

      const result = moveLine(line);

      if (direction === "down") {
        result.line.reverse();
      }

      for (let row = 0; row < 4; row++) {
        if (gameState.board[row][col] !== result.line[row]) {
          changed = true;
        }

        gameState.board[row][col] = result.line[row];
      }

      scoreGained += result.scoreGained;
    }
  }

  // Якщо хід нічого не змінив — нічого більше не робимо
  if (!changed) {
    return;
  }

  gameState.score += scoreGained;

  addRandomTile();

  checkTarget();

  if (!canMove()) {
    gameState.gameOver = true;
    clearGameState(GAME_ID);
  } else {
    saveGameState(GAME_ID, gameState);
  }

  render();

  if (gameState.gameOver) {
    showGameOver();
  } else if (gameState.targetReached) {
    showTargetMessage();
  }
}

function handleKeyDown(event) {
  switch (event.key) {
    case "ArrowLeft":
      move("left");
      break;

    case "ArrowRight":
      move("right");
      break;

    case "ArrowUp":
      move("up");
      break;

    case "ArrowDown":
      move("down");
      break;
  }
}

function canMove() {
  // Є порожня клітинка
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (gameState.board[row][col] === 0) {
        return true;
      }
    }
  }

  // Перевіряємо сусідні клітинки
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const value = gameState.board[row][col];

      // Праворуч
      if (col < 3 && value === gameState.board[row][col + 1]) {
        return true;
      }

      // Вниз
      if (row < 3 && value === gameState.board[row + 1][col]) {
        return true;
      }
    }
  }

  return false;
}

function showGameOver() {
  gameMessage.innerHTML = `
        <div>Гру завершено!</div>
        <div>Ваш рахунок: ${gameState.score}</div>
    `;
}

function checkTarget() {
  if (gameState.targetReached) {
    return;
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (gameState.board[row][col] >= gameState.target) {
        gameState.targetReached = true;
        return;
      }
    }
  }
}

function showTargetMessage() {
  gameMessage.innerHTML = `
        <div>🎉 Вітаємо! Ви досягли 2048!</div>
        <button id="continueGame" class="game__continue">
            Продовжити гру
        </button>
    `;

  const continueButton = document.getElementById("continueGame");

  continueButton.addEventListener("click", () => {
    gameMessage.innerHTML = "";
  });
}
document.addEventListener("keydown", handleKeyDown);
newGameButton.addEventListener("click", newGame);

initSwipe(gameBoard, (direction) => {
  move(direction);
});

const savedState = loadGameState(GAME_ID);

if (savedState) {
  gameState = savedState;
} else {
  newGame();
}

render();
