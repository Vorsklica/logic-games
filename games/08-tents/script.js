import data from "./content/data-001/data.js";

console.log("GAME DATA:", data);

document.getElementById("gameTitle").textContent = data.title;

function createBoard() {
  const board = document.getElementById("gameBoard");
  const size = data.size;

  board.innerHTML = "";

  board.style.gridTemplateColumns = `repeat(${size + 1}, var(--cell-size))`;

  // Координати дерев
  const treePositions = new Set(
    data.trees.map(([row, col]) => `${row},${col}`),
  );

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

      // Координати data.trees починаються з 1
      const position = `${row + 1},${col + 1}`;

      // Дерево
      if (treePositions.has(position)) {
        const tree = document.createElement("img");

        tree.src = "./images/tree.png";
        tree.className = "game__tree";
        tree.alt = "";

        tree.addEventListener("click", (event) => {
          event.stopPropagation();
        });

        cell.appendChild(tree);
        cell.classList.add("has-tree");

        // Клітинка з деревом відкрита
        cell.classList.add("revealed");
      }

      // Тестове відкриття клітинки натисканням
      cell.addEventListener("click", () => {
        cell.classList.toggle("revealed");
      });

      board.appendChild(cell);
    }
  }
}

createBoard();
