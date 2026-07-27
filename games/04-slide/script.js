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
const messageElement = document.getElementById("game-message");
const restartButtonElement = document.getElementById("restart-button");

/* =========================================
   Стан гри
   ========================================= */

let info = null;
let imagePath = "";

let board = [];
let solvedBoard = [];

let moves = 0;
let startTime = null;
let timerId = null;

/**Для реалізації свпйпу на телефоні */
let touchStartX = 0;
let touchStartY = 0;

let touchTile = null;
let touchDragging = false;

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

  tryMoveTile(tileNumber);
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

/**
 * Перевіряє, чи зібраний пазл.
 */
function checkWin() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== solvedBoard[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Запускає таймер.
 */
function startTimer() {
  startTime = Date.now();

  timerId = setInterval(updateTimer, 1000);
}

/**
 * Оновлює показання таймера.
 */
function updateTimer() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Зупиняє таймер.
 */
function stopTimer() {
  clearInterval(timerId);

  timerId = null;
}

/**
 * Виводить повідомлення про завершення гри.
 */
function showWinMessage() {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);

  const formattedTime = formatTime(totalSeconds);

  messageElement.innerHTML = `
    <strong>🎉 Гру завершено!</strong><br>
    Час: ${formattedTime}<br>
    Ходів: ${moves}
  `;
}

/**
 * Запускає нову гру.
 */
function restartGame() {
  gameBoardElement.classList.remove("game__board--completed");
  moves = 0;
  startTime = null;

  messageElement.textContent = "";

  movesElement.textContent = "0";
  timerElement.textContent = "00:00";

  init();
}

/**
 * Оформлює поле після завершення гри.
 */
function completeBoard() {
  gameBoardElement.classList.add("game__board--completed");

  const tiles = gameBoardElement.querySelectorAll(".game__tile");

  for (const tile of tiles) {
    tile.classList.add("game__tile--completed");

    const badge = tile.querySelector(".game__tile-number");

    if (badge) {
      badge.classList.add("game__tile-number--hidden");
    }
  }
  const emptyTile = gameBoardElement.querySelector(".game__tile--empty");
  if (!emptyTile) {
    return;
  }
  const row = info.size - 1;
  const col = info.size - 1;
  emptyTile.style.backgroundImage = `url("${imagePath}")`;

  emptyTile.style.backgroundSize = `${info.size * 100}%`;

  emptyTile.style.backgroundPosition = `${(col * 100) / (info.size - 1)}% ${(row * 100) / (info.size - 1)}%`;
  emptyTile.classList.remove("game__tile--empty");
  emptyTile.classList.add("game__tile--completed");
}
/**
 * Форматує час у хвилини та секунди.
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes} хв ${String(seconds).padStart(2, "0")} с`;
}

/**
 * Виконує спробу перемістити плитку.
 */
function tryMoveTile(tileNumber) {
  const tileIndex = board.indexOf(tileNumber);

  if (!canMove(tileIndex)) {
    return;
  }

  moveTile(tileIndex);

  if (startTime === null) {
    startTimer();
  }

  moves++;
  movesElement.textContent = moves;

  renderGameBoard();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (checkWin()) {
        stopTimer();
        showWinMessage();
        completeBoard();
        restartButtonElement.classList.remove("is-hidden");
      }
    });
  });
}

function onTouchStart(event) {
  const tile = event.target.closest(".game__tile");

  if (!tile) {
    return;
  }

  touchTile = tile;

  const touch = event.touches[0];

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  touchDragging = false;

  messageElement.textContent = "TOUCH START";
}

function onTouchMove(event) {
  event.preventDefault();
  if (!touchTile) {
    return;
  }

  event.preventDefault();

  const touch = event.touches[0];

  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  const distance = Math.hypot(deltaX, deltaY);

  if (distance > 20 && !touchDragging) {
    touchDragging = true;

    messageElement.textContent = "MOVE!";

    const tileNumber = Number(touchTile.dataset.number);

    tryMoveTile(tileNumber);
  }
}

function onTouchEnd() {
  touchTile = null;
  touchDragging = false;
}

/* =========================================
   Ініціалізація
   ========================================= */
async function init() {
  ({ info, imagePath } = await loadContent());

  gameTitleElement.textContent = info.title;

  createBoardModel(info.size);

  // Запам'ятовуємо правильний стан пазла.
  solvedBoard = board.slice();

  shuffleBoard();

  renderGameBoard();

  restartButtonElement.classList.add("is-hidden");
}

/* =========================================
   Запуск гри
   ========================================= */

gameBoardElement.addEventListener("click", onBoardClick);
restartButtonElement.addEventListener("click", restartGame);

gameBoardElement.addEventListener("touchstart", onTouchStart);
gameBoardElement.addEventListener("touchmove", onTouchMove);
gameBoardElement.addEventListener("touchend", onTouchEnd);

init();
