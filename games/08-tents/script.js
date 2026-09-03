import data from "./content/data-001/data.js";

console.log("GAME DATA:", data);

document.getElementById("gameTitle").textContent = data.title;

function createBoard() {
  const board = document.getElementById("gameBoard");
  const size = data.size;

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
    const hint = document.createElement("div");

    hint.className = "game__cell game__hint game__row-hint";
    hint.textContent = data.rows[row];

    board.appendChild(hint);

    // Ігрове поле
    for (let col = 0; col < size; col++) {
      const cell = document.createElement("div");

      cell.className = "game__cell game__play-cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      board.appendChild(cell);
    }
  }
}

createBoard();
