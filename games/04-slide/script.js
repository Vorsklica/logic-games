/**
 * Slide
 * Головний файл гри.
 */

/* =========================================
   Імпорт модулів
   ========================================= */

import { getDataFolder } from "../common/url.js";
import config from "./config.js";

/* =========================================
   Елементи сторінки
   ========================================= */

const gameTitleElement = document.getElementById("game-title");
const gameBoardElement = document.getElementById("game-board");
const timerElement = document.getElementById("timer");
const movesElement = document.getElementById("moves");
const messageElement = document.getElementById("message");
const restartButtonElement = document.getElementById("restart-button");

/* =========================================
   Стан гри
   ========================================= */

let info = null;
let imagePath = "";

let board = [];

let moves = 0;
let startTime = null;
let gameFinished = false;

/* =========================================
   Завантаження даних
   ========================================= */

async function loadContent() {
  const dataFolder = getDataFolder();

  const module = await import(`./content/${dataFolder}/info.js`);

  return {
    info: module.default,
    imagePath: `./content/${dataFolder}/image.jpg`,
  };
}

/**
 * Створює одну плитку.
 */
function createTile(number, size, imagePath) {
  const tile = document.createElement("div");

  tile.dataset.number = number;

  if (number === 0) {
    tile.className = "game__tile game__tile--empty";

    return tile;
  }

  tile.className = "game__tile";

  const row = Math.floor((number - 1) / size);
  const col = (number - 1) % size;

  tile.style.backgroundImage = `url("${imagePath}")`;
  tile.style.backgroundSize = `${size * 100}%`;

  tile.style.backgroundPosition = `${(col * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`;

  const badge = document.createElement("div");
  badge.className = "game__tile-number";
  badge.textContent = number;

  tile.appendChild(badge);

  return tile;
}

/**
 * Створює початкову модель пазла.
 */
function createBoardModel(size) {
  board = [];

  const tilesCount = size * size;

  for (let number = 1; number < tilesCount; number++) {
    board.push(number);
  }

  board.push(0);
}

/**
 * Створює ігрове поле.
 */

function renderGameBoard() {
  gameBoardElement.innerHTML = "";

  gameBoardElement.style.gridTemplateColumns = `repeat(${info.size}, 1fr)`;

  for (const number of board) {
    gameBoardElement.appendChild(createTile(number, info.size, imagePath));
  }
}
/**
 *         Обробка кліку по ігровому полю
 */
function onBoardClick(event) {
  const tile = event.target.closest(".game__tile");

  if (!tile) {
    return;
  }

  const tileNumber = Number(tile.dataset.number);
  const tileIndex = board.indexOf(tileNumber);

  if (!canMove(tileIndex)) {
    return;
  }

  moveTile(tileIndex);

  moves++;
  movesElement.textContent = moves;

  renderGameBoard();
  //console.log(getAvailableMoves());
}

/**
 * Переміщує плитку на порожнє місце.
 */
function moveTile(tileIndex) {
  const emptyIndex = board.indexOf(0);

  [board[tileIndex], board[emptyIndex]] = [board[emptyIndex], board[tileIndex]];
}
/**
 * Повертає True, якщо плитку можна перемістити
 */

function canMove(tileIndex) {
  const emptyIndex = board.indexOf(0);

  const tileRow = Math.floor(tileIndex / info.size);
  const tileCol = tileIndex % info.size;

  const emptyRow = Math.floor(emptyIndex / info.size);
  const emptyCol = emptyIndex % info.size;

  return Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol) === 1;
}

/**
 * Повертає список індексів плиток,
 * які можна пересунути.
 */
function getAvailableMoves() {
  const availableMoves = [];

  const emptyIndex = board.indexOf(0);

  const row = Math.floor(emptyIndex / info.size);
  const col = emptyIndex % info.size;

  // Зверху
  if (row > 0) {
    availableMoves.push(emptyIndex - info.size);
  }

  // Знизу
  if (row < info.size - 1) {
    availableMoves.push(emptyIndex + info.size);
  }

  // Ліворуч
  if (col > 0) {
    availableMoves.push(emptyIndex - 1);
  }

  // Праворуч
  if (col < info.size - 1) {
    availableMoves.push(emptyIndex + 1);
  }

  return availableMoves;
}

/**
 * Виконує один випадковий крок перемішування.
 */
function shuffleStep() {
  const availableMoves = getAvailableMoves();

  const randomIndex = Math.floor(Math.random() * availableMoves.length);

  const tileIndex = availableMoves[randomIndex];

  moveTile(tileIndex);
}

/**
 * Перемішує пазл.
 */
function shuffleBoard() {
  for (let i = 0; i < config.shuffleSteps; i++) {
    shuffleStep();
  }
}

/* =========================================
   Ініціалізація
   ========================================= */
async function init() {
  ({ info, imagePath } = await loadContent());

  gameTitleElement.textContent = info.title;

  createBoardModel(info.size);

  shuffleBoard();

  renderGameBoard();

  gameBoardElement.addEventListener("click", onBoardClick);
}

/* =========================================
   Запуск гри
   ========================================= */

init();
