import { getDataFolder } from "../common/url.js";
import { generateHints } from "./common/hints.js";
import {
  saveGameState,
  loadGameState,
  hasGameState,
  clearGameState,
} from "../common/gameStorage.js";

let GAME_ID = "05-japanese-crossword";
let gameState;
//const dataFolder = getDataFolder();
const gameData = await loadGameData();
const gameBoard = document.getElementById("gameBoard");
gameBoard.addEventListener("click", onCellClick);

function initializeGame(gameData) {
  const savedState = loadGameState(GAME_ID);

  if (savedState && confirm("Продовжити збережену гру?")) {
    gameState = savedState;
  } else {
    gameState = createGameState(gameData);
    clearGameState();
  }

  createGameBoard(gameData);
  renderGameBoard(gameState);

  const hints = generateHints(gameData.bitmap);

  renderRowHints(hints.rows);
  renderColumnHints(hints.cols);
}

async function loadGameData() {
  const dataFolder = getDataFolder();
  GAME_ID += dataFolder;
  const module = await import(`./content/${dataFolder}/data.js`);

  return module.default;
}

function createCell(row, col) {
  const cell = document.createElement("div");

  cell.classList.add("game__cell");

  if ((col + 1) % 5 === 0) {
    cell.classList.add("game__cell--major-column");
  }

  if ((row + 1) % 5 === 0) {
    cell.classList.add("game__cell--major-row");
  }

  cell.dataset.row = row;
  cell.dataset.col = col;

  return cell;
}
function createGameBoard(gameData) {
  const { width, height } = gameData;

  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const cell = createCell(row, col);

      gameBoard.appendChild(cell);
    }
  }
}

function renderGameBoard(gameState) {
  const { bitmap } = gameState;

  const cells = gameBoard.querySelectorAll(".game__cell");

  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    cell.classList.toggle("game__cell--filled", bitmap[row][col] === 1);

    cell.classList.toggle("game__cell--cross", bitmap[row][col] === 2);
  });
}

function createGameState(gameData) {
  const { width, height } = gameData;

  return {
    bitmap: Array.from({ length: height }, () => Array(width).fill(0)),
  };
}

function onCellClick(event) {
  const cell = event.target.closest(".game__cell");

  if (!cell) {
    return;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  gameState.bitmap[row][col] = (gameState.bitmap[row][col] + 1) % 3;

  renderGameBoard(gameState);

  saveGameState(GAME_ID, gameState);

  if (checkSolution()) {
    finishGame();
    clearGameState(GAME_ID);
  }
}
function createRowHint(hint) {
  const element = document.createElement("div");

  element.classList.add("game__row-hint");

  element.textContent = hint.join(" ");

  return element;
}

function renderRowHints(hints) {
  rowHints.innerHTML = "";

  hints.forEach((hint) => {
    const element = createRowHint(hint);

    rowHints.appendChild(element);
  });
}

function createColumnHint(hint) {
  const element = document.createElement("div");

  element.classList.add("game__column-hint");

  hint.forEach((value) => {
    const item = document.createElement("div");

    item.textContent = value;

    element.appendChild(item);
  });

  return element;
}
function renderColumnHints(hints) {
  columnHints.innerHTML = "";

  columnHints.style.gridTemplateColumns = `repeat(${hints.length}, var(--cell-size))`;

  hints.forEach((hint) => {
    const element = createColumnHint(hint);

    columnHints.appendChild(element);
  });
}
function checkSolution() {
  const { bitmap: solution } = gameData;
  const { bitmap: player } = gameState;

  for (let row = 0; row < gameData.height; row++) {
    for (let col = 0; col < gameData.width; col++) {
      if (solution[row][col] !== player[row][col] % 2) {
        return false;
      }
    }
  }

  return true;
}
function finishGame() {
  gameStatus.textContent = "Гру завершено 🎉";
  gameBoard.style.pointerEvents = "none";

  gameStatus.classList.add("game__status--finished");
  clearGameState();
}

initializeGame(gameData);
