/**
 * Slide
 * Головний файл гри.
 */

/* =========================================
   Імпорт модулів
   ========================================= */

import { getDataFolder } from "../common/url.js";

/* =========================================
   Елементи сторінки
   ========================================= */

const gameTitle = document.getElementById("game-title");
const gameBoard = document.getElementById("game-board");
const timer = document.getElementById("timer");
const moves = document.getElementById("moves");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart-button");

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
 * Створює ігрове поле.
 */

function createBoard(info, imagePath) {
  gameBoard.innerHTML = "";

  gameBoard.style.gridTemplateColumns = `repeat(${info.size}, 1fr)`;

  const tilesCount = info.size * info.size;

  for (let number = 1; number < tilesCount; number++) {
    const tile = createTile(number, info.size, imagePath);

    gameBoard.appendChild(tile);
  }
}

/* =========================================
   Ініціалізація
   ========================================= */
async function init() {
  const { info, imagePath } = await loadContent();

  gameTitle.textContent = info.title;

  createBoard(info, imagePath);
}
/* =========================================
   Запуск гри
   ========================================= */

init();
