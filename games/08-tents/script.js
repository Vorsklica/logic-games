import data from "./content/data-001/data.js";
import { showMessage } from "../common/message.js";

const requiredTentCount = data.rows.reduce((sum, count) => sum + count, 0); //Кількість палаток

const CELL_STATE = {
  UNKNOWN: "unknown",
  TREE: "tree",
  TENT: "tent",
  MARKED: "marked",
};

const gameState = {
  size: data.size,
  cells: [],
  gameOver: false,
};

function createGameState() {
  gameState.gameOver = false;
  gameState.cells = Array.from({ length: gameState.size }, () =>
    Array(gameState.size).fill(CELL_STATE.UNKNOWN),
  );

  // Встановлюємо дерева
  for (const [row, col] of data.trees) {
    gameState.cells[row - 1][col - 1] = CELL_STATE.TREE;
  }
}

function createGameBoard() {
  const board = document.getElementById("gameBoard");
  const size = gameState.size;

  board.innerHTML = "";

  board.style.gridTemplateColumns = `repeat(${size + 1}, var(--cell-size))`;

  // Верхній лівий кут
  const corner = document.createElement("div");

  corner.className = "game__cell";

  board.appendChild(corner);

  // Числа стовпців
  for (let col = 0; col < size; col++) {
    const cell = document.createElement("div");

    cell.className = "game__cell game__hint game__column-hint";
    cell.textContent = data.cols[col];

    board.appendChild(cell);
  }

  // Рядки
  for (let row = 0; row < size; row++) {
    // Число рядка
    const hint = document.createElement("div");

    hint.className = "game__cell game__hint game__row-hint";
    hint.textContent = data.rows[row];

    board.appendChild(hint);

    // Ігрові клітинки
    for (let col = 0; col < size; col++) {
      const cell = document.createElement("div");

      cell.className = "game__cell game__play-cell";

      cell.dataset.row = row;
      cell.dataset.col = col;

      renderCell(cell, row, col);

      board.appendChild(cell);
      cell.addEventListener("click", onCellClick);
    }
  }
}

function renderCell(cell, row, col) {
  const state = gameState.cells[row][col];

  cell.innerHTML = "";
  cell.classList.remove("revealed", "has-tree");

  if (state === CELL_STATE.TREE) {
    const tree = document.createElement("img");

    tree.src = "./images/tree.png";
    tree.className = "game__tree";
    tree.alt = "";

    tree.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    cell.appendChild(tree);

    cell.classList.add("has-tree");
    cell.classList.add("revealed");
  }

  if (state === CELL_STATE.TENT) {
    const tent = document.createElement("img");

    tent.src = "./images/tent.png";
    tent.className = "game__tent";
    tent.alt = "";

    cell.appendChild(tent);

    cell.classList.add("revealed");
  }

  if (state === CELL_STATE.MARKED) {
    cell.classList.add("revealed");
  }
}

function onCellClick(event) {
  if (gameState.gameOver) {
    return;
  }
  const cell = event.currentTarget;

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  const state = gameState.cells[row][col];

  if (state === CELL_STATE.TREE) {
    return;
  }

  if (state === CELL_STATE.UNKNOWN) {
    gameState.cells[row][col] = CELL_STATE.TENT;
  } else if (state === CELL_STATE.TENT) {
    gameState.cells[row][col] = CELL_STATE.MARKED;
  } else if (state === CELL_STATE.MARKED) {
    gameState.cells[row][col] = CELL_STATE.UNKNOWN;
  }

  renderCell(cell, row, col);

  if (checkGame()) {
    finishGame();
  }
}

function getTentCount() {
  let tentCount = 0;

  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      if (gameState.cells[row][col] === CELL_STATE.TENT) {
        tentCount++;
      }
    }
  }

  return tentCount;
}

function checkGame() {
  if (getTentCount() !== requiredTentCount) return false;
  if (!checkTentCount()) return false;
  if (!checkRows()) return false;
  if (!checkColumns()) return false;
  if (!checkTrees()) return false;
  if (!checkTentNeighbors()) return false;

  return true;
}

function checkTentCount() {
  let tentCount = 0;

  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      if (gameState.cells[row][col] === CELL_STATE.TENT) {
        tentCount++;
      }
    }
  }

  return tentCount === data.trees.length;
}

function checkRows() {
  for (let row = 0; row < gameState.size; row++) {
    let tentCount = 0;

    for (let col = 0; col < gameState.size; col++) {
      if (gameState.cells[row][col] === CELL_STATE.TENT) {
        tentCount++;
      }
    }

    if (tentCount !== data.rows[row]) {
      return false;
    }
  }

  return true;
}

function checkColumns() {
  for (let col = 0; col < gameState.size; col++) {
    let tentCount = 0;

    for (let row = 0; row < gameState.size; row++) {
      if (gameState.cells[row][col] === CELL_STATE.TENT) {
        tentCount++;
      }
    }

    if (tentCount !== data.cols[col]) {
      return false;
    }
  }

  return true;
}

function checkTrees() {
  for (const [treeRow, treeCol] of data.trees) {
    const row = treeRow - 1;
    const col = treeCol - 1;

    let tentCount = 0;

    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

    for (const [neighborRow, neighborCol] of neighbors) {
      if (
        neighborRow >= 0 &&
        neighborRow < gameState.size &&
        neighborCol >= 0 &&
        neighborCol < gameState.size &&
        gameState.cells[neighborRow][neighborCol] === CELL_STATE.TENT
      ) {
        tentCount++;
      }
    }

    if (tentCount !== 1) {
      return false;
    }
  }

  return true;
}

function checkTentNeighbors() {
  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      if (gameState.cells[row][col] !== CELL_STATE.TENT) {
        continue;
      }

      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          if (rowOffset === 0 && colOffset === 0) {
            continue;
          }

          const neighborRow = row + rowOffset;
          const neighborCol = col + colOffset;

          if (
            neighborRow >= 0 &&
            neighborRow < gameState.size &&
            neighborCol >= 0 &&
            neighborCol < gameState.size &&
            gameState.cells[neighborRow][neighborCol] === CELL_STATE.TENT
          ) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

function finishGame() {
  gameState.gameOver = true;

  showMessage({
    title: "Вітаємо!",
    text: "Ви правильно розставили всі намети.",
    buttonText: "Добре",
  });
}

function onRestartButtonClick() {
  createGameState();
  createGameBoard();
}

function init() {
  document.getElementById("gameTitle").textContent = data.title;

  createGameState();

  createGameBoard();

  const restartButton = document.getElementById("restartButton");

  restartButton.addEventListener("click", onRestartButtonClick);
}

init();
