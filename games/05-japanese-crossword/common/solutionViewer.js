/**
 * Ініціалізує модуль перегляду розв'язків.
 */
let editorSolutionViewer;
let editorSolutionInfo;
let editorSolutionBoard;

let editorSolutionCloseButton;
let editorPreviousSolutionButton;
let editorNextSolutionButton;

let solutions = [];
let currentSolution = 0;

export function initializeSolutionViewer() {
  editorSolutionViewer = document.getElementById("editor_solutionViewer");
  editorSolutionInfo = document.getElementById("editor_solutionInfo");
  editorSolutionBoard = document.getElementById("editor_solutionBoard");

  editorSolutionCloseButton = document.getElementById(
    "editor_solutionCloseButton",
  );

  editorPreviousSolutionButton = document.getElementById(
    "editor_previousSolutionButton",
  );

  editorNextSolutionButton = document.getElementById(
    "editor_nextSolutionButton",
  );

  editorSolutionCloseButton.addEventListener("click", hideSolutions);

  editorPreviousSolutionButton.addEventListener("click", showPreviousSolution);

  editorNextSolutionButton.addEventListener("click", showNextSolution);
}

/**
 * Відображає вікно перегляду розв'язків.
 *
 * @param {number[][][]} solutions Масив bitmap-ів.
 */
export function showSolutions(newSolutions) {
  solutions = newSolutions;

  currentSolution = 0;

  createSolutionBoard(solutions[0][0].length, solutions[0].length);

  renderSolutionBoard(solutions[0]);

  updateSolutionInfo();
  updateNavigationButtons();

  editorSolutionViewer.classList.remove("editor__solutionViewer--hidden");
}

/**
 * Створює ігрове поле перегляду розв'язків.
 *
 * @param {number} width Кількість колонок.
 * @param {number} height Кількість рядків.
 */
function createSolutionBoard(width, height) {
  editorSolutionBoard.innerHTML = "";

  editorSolutionBoard.style.gridTemplateColumns = `repeat(${width}, var(--editor-cell-size))`;

  editorSolutionBoard.style.gridTemplateRows = `repeat(${height}, var(--editor-cell-size))`;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const cell = document.createElement("div");

      cell.className = "editor__cell";

      editorSolutionBoard.appendChild(cell);
    }
  }
}

/**
 * Відображає bitmap у полі перегляду розв'язків.
 *
 * @param {number[][]} bitmap Bitmap розв'язку.
 */
function renderSolutionBoard(bitmap) {
  const cells = editorSolutionBoard.children;

  let index = 0;

  for (let row = 0; row < bitmap.length; row++) {
    for (let col = 0; col < bitmap[row].length; col++) {
      const cell = cells[index++];

      cell.classList.toggle("editor__cell--filled", bitmap[row][col] === 1);
    }
  }
}

/**
 * Закриває вікно перегляду.
 */
function hideSolutions() {
  editorSolutionViewer.classList.add("editor__solutionViewer--hidden");
}

/**
 * Оновлює інформацію про поточний розв'язок.
 */
function updateSolutionInfo() {
  editorSolutionInfo.textContent = `Розв'язок ${currentSolution + 1} із ${solutions.length}`;
}

/**
 * Оновлює стан кнопок навігації.
 */
function updateNavigationButtons() {
  editorPreviousSolutionButton.disabled = currentSolution === 0;

  editorNextSolutionButton.disabled = currentSolution === solutions.length - 1;
}

function showPreviousSolution() {
  if (currentSolution === 0) {
    return;
  }

  currentSolution--;

  renderSolutionBoard(solutions[currentSolution]);

  updateSolutionInfo();
  updateNavigationButtons();
}

function showNextSolution() {
  if (currentSolution >= solutions.length - 1) {
    return;
  }

  currentSolution++;

  renderSolutionBoard(solutions[currentSolution]);

  updateSolutionInfo();
  updateNavigationButtons();
}

function renderSolution() {}
