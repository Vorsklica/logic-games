// Знаходимо контейнер для ігрового поля
const gameBoard = document.getElementById("game-board");

const newGameButton = document.getElementById("new-game");

const message = document.getElementById("message");

const board = [
  [false, false, false, false],
  [false, false, false, false],
  [false, false, false, false],
  [false, false, false, false],
];

// Масив напрямків
const directions = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const cells = [];

function createBoard() {
  for (let row = 0; row < 4; row++) {
    cells[row] = [];

    for (let col = 0; col < 4; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cells[row][col] = cell;
      cell.addEventListener("click", function () {
        flipCells(row, col);
        drawBoard();
        if (checkWin()) {
          message.textContent = GAME.winMessage;
        }
      });

      gameBoard.appendChild(cell);
    }
  }
}

function drawBoard() {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col]) {
        cells[row][col].classList.add("active");
      } else {
        cells[row][col].classList.remove("active");
      }
    }
  }
}

function flipCells(row, col) {
  for (const direction of directions) {
    const newRow = row + direction[0];
    const newCol = col + direction[1];

    if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
      board[newRow][newCol] = !board[newRow][newCol];
    }
  }
}

function checkWin() {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col]) {
        return false;
      }
    }
  }

  return true;
}

function clearBoard() {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      board[row][col] = false;
    }
  }
}

function randomizeBoard(moves) {
  message.textContent = "";
  clearBoard();

  for (let i = 0; i < moves; i++) {
    const row = Math.floor(Math.random() * 4);
    const col = Math.floor(Math.random() * 4);

    flipCells(row, col);
  }

  drawBoard();
}

newGameButton.addEventListener("click", function () {
  randomizeBoard(GAME.randomMoves);
});

document.getElementById("game-title").textContent = GAME.title;

createBoard();

randomizeBoard(GAME.randomMoves);

/*
window.addEventListener("DOMContentLoaded", function () {

    document.getElementById("game-title").textContent = GAME.title;

    createBoard();

    randomizeBoard(GAME.randomMoves);

});


*/
