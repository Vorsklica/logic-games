/**
 * Генератор задач "Намети і дерева".
 *
 * На цьому етапі:
 * - поле квадратне;
 * - розмір від 5 до 12;
 * - кількість дерев ≈ 20% клітинок;
 * - дерево та його намет створюються одразу парою;
 * - намети не можуть сусідити навіть по діагоналі;
 * - rows і cols обчислюються з готового рішення;
 * - результат виводиться в консоль.
 */

/**
 * Генерує задачу з єдиним розв'язком.
 *
 * Повторює генерацію, доки не буде отримана
 * задача з унікальним розв'язком.
 */
/**
 * Генерує задачу з єдиним розв'язком.
 *
 * Повторює генерацію, доки не буде отримана
 * задача з унікальним розв'язком.
 */
function generatePuzzle(size) {
  const maxAttempts = 100;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let puzzle;

    try {
      puzzle = generateCandidatePuzzle(size);
    } catch (error) {
      // Не вдалося побудувати повну конфігурацію пар.
      // Це просто невдала спроба — починаємо нову.
      continue;
    }

    if (hasUniqueSolution(puzzle)) {
      console.log(`✓ Задача згенерована за ${attempt} спроб.`);

      printPuzzle(puzzle);

      return puzzle;
    }
  }

  throw new Error(
    `Не вдалося згенерувати задачу з єдиним розв'язком ` +
      `за ${maxAttempts} спроб.`,
  );
}

/**
 * Генерує задачу заданого розміру.
 *
 * @param {number} size Розмір квадратного поля (5–12).
 * @returns {object} Згенерована задача.
 */
function generateCandidatePuzzle(size) {
  validateSize(size);

  const treeCount = Math.round(size * size * 0.2);

  const board = createEmptyBoard(size);
  const pairs = [];

  let attempts = 0;
  const maxAttempts = size * size * 100;

  while (pairs.length < treeCount && attempts < maxAttempts) {
    attempts++;

    const pair = findRandomPair(board, size);

    if (!pair) {
      break;
    }

    placePair(board, pair);
    pairs.push(pair);
  }

  if (pairs.length < treeCount) {
    throw new Error(
      `Не вдалося розмістити ${treeCount} пар. ` +
        `Розміщено: ${pairs.length}.`,
    );
  }

  const rows = calculateRows(board, size);
  const cols = calculateCols(board, size);

  const trees = pairs
    .map((pair) => [pair.tree[0] + 1, pair.tree[1] + 1])
    .sort(compareCoordinates);

  const solution = board.map((row) => [...row]);

  const puzzle = {
    size,
    rows,
    cols,
    trees,
    solution,
  };

  return puzzle;
}

/**
 * Перевіряє розмір поля.
 */
function validateSize(size) {
  if (!Number.isInteger(size) || size < 5 || size > 12) {
    throw new Error("Розмір поля має бути цілим числом від 5 до 12.");
  }
}

/**
 * Створює порожнє поле.
 *
 * "." — порожня клітинка
 * "T" — дерево
 * "A" — намет
 */
function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill("."));
}

/**
 * Шукає випадкову допустиму пару:
 *
 *    T A
 *
 * або
 *
 *    A
 *    T
 *
 * тощо.
 */
function findRandomPair(board, size) {
  const candidates = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== ".") {
        continue;
      }

      const tree = [row, col];

      const directions = shuffle([
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);

      for (const [dr, dc] of directions) {
        const tentRow = row + dr;
        const tentCol = col + dc;

        if (tentRow < 0 || tentRow >= size || tentCol < 0 || tentCol >= size) {
          continue;
        }

        if (canPlacePair(board, tree, [tentRow, tentCol])) {
          candidates.push({
            tree,
            tent: [tentRow, tentCol],
          });
        }
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return randomItem(candidates);
}

/**
 * Перевіряє, чи можна встановити дерево і намет.
 */
function canPlacePair(board, tree, tent) {
  const [treeRow, treeCol] = tree;
  const [tentRow, tentCol] = tent;

  // Обидві клітинки повинні бути порожні.
  if (board[treeRow][treeCol] !== ".") {
    return false;
  }

  if (board[tentRow][tentCol] !== ".") {
    return false;
  }

  // Перевіряємо, щоб новий намет не мав
  // сусіднього намету (включно по діагоналі).
  if (hasAdjacentTent(board, tentRow, tentCol)) {
    return false;
  }

  return true;
}

/**
 * Встановлює пару на поле.
 */
function placePair(board, pair) {
  const [treeRow, treeCol] = pair.tree;
  const [tentRow, tentCol] = pair.tent;

  board[treeRow][treeCol] = "T";
  board[tentRow][tentCol] = "A";
}

/**
 * Перевіряє сусідство наметів.
 *
 * Перевіряються всі 8 сусідніх клітинок.
 */
function hasAdjacentTent(board, row, col) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) {
        continue;
      }

      const r = row + dr;
      const c = col + dc;

      if (
        r >= 0 &&
        r < board.length &&
        c >= 0 &&
        c < board.length &&
        board[r][c] === "A"
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Обчислює кількість наметів у кожному рядку.
 */
function calculateRows(board, size) {
  return board.map((row) => row.filter((cell) => cell === "A").length);
}

/**
 * Обчислює кількість наметів у кожному стовпці.
 */
function calculateCols(board, size) {
  const cols = Array(size).fill(0);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === "A") {
        cols[col]++;
      }
    }
  }

  return cols;
}

/**
 * Виводить результат у консоль.
 */
function printPuzzle(puzzle) {
  console.log(`export default {`);
  console.log(`  title: "Намети і дерева",`);
  console.log(`  size: ${puzzle.size},`);
  console.log(`  rows: [${puzzle.rows.join(", ")}],`);
  console.log(`  cols: [${puzzle.cols.join(", ")}],`);
  console.log(`  trees: [`);

  for (const [row, col] of puzzle.trees) {
    console.log(`    [${row}, ${col}],`);
  }

  console.log(`  ],`);

  console.log(`  solution: [`);

  for (const row of puzzle.solution) {
    console.log(`    [${row.map((cell) => `"${cell}"`).join(", ")}],`);
  }

  console.log(`  ],`);
  console.log(`};`);

  console.log("");
}
/**
 * Повертає випадковий елемент масиву.
 */
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Випадково перемішує масив.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/**
 * Порівнює координати [row, col].
 */
function compareCoordinates(a, b) {
  if (a[0] !== b[0]) {
    return a[0] - b[0];
  }

  return a[1] - b[1];
}

/**
 * Створює початкові списки кандидатів
 * для кожного дерева.
 *
 * Координати всередині солвера — 0-based.
 */
function getTentCandidates(puzzle) {
  const { size, rows, cols, trees } = puzzle;

  const treeSet = new Set(trees.map(([row, col]) => `${row - 1},${col - 1}`));

  return trees.map(([treeRow, treeCol]) => {
    const row = treeRow - 1;
    const col = treeCol - 1;

    const candidates = [];

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dr, dc] of directions) {
      const candidateRow = row + dr;
      const candidateCol = col + dc;

      // За межами поля.
      if (
        candidateRow < 0 ||
        candidateRow >= size ||
        candidateCol < 0 ||
        candidateCol >= size
      ) {
        continue;
      }

      // У клітинці вже стоїть дерево.
      if (treeSet.has(`${candidateRow},${candidateCol}`)) {
        continue;
      }

      // У цьому рядку наметів бути не може.
      if (rows[candidateRow] === 0) {
        continue;
      }

      // У цьому стовпці наметів бути не може.
      if (cols[candidateCol] === 0) {
        continue;
      }

      candidates.push([candidateRow, candidateCol]);
    }

    return candidates;
  });
}

function createSolverState(puzzle, candidates) {
  return {
    candidates: candidates.map((treeCandidates) =>
      treeCandidates.map(([row, col]) => [row, col]),
    ),

    // Підтверджені клітинки-намети.
    tents: [],

    // Визначений намет для кожного дерева.
    resolvedTents: Array(candidates.length).fill(null),

    // Скільки наметів ще потрібно поставити
    // у кожному рядку та стовпці.
    remainingRows: [...puzzle.rows],
    remainingCols: [...puzzle.cols],

    contradiction: false,

    statistics: {
      iterations: 0,
      forcedTents: 0,
      removedCandidates: 0,
    },
  };
}

/**
 * Логічно скорочує списки кандидатів.
 *
 * Працює доти, доки жодного нового кандидата
 * вже не можна вилучити або зафіксувати.
 */
function reduceCandidates(puzzle, state, assumptions = []) {
  const { size } = puzzle;

  const candidates = state.candidates;
  const tents = state.tents;
  const resolvedTents = state.resolvedTents;
  const remainingRows = state.remainingRows;
  const remainingCols = state.remainingCols;
  const tentSet = new Set(tents.map(([row, col]) => `${row},${col}`));

  // --------------------------------------------------
  // Початкові припущення.
  // --------------------------------------------------
  for (const { treeIndex, tent } of assumptions) {
    candidates[treeIndex] = [tent];
  }

  let changed = true;
  let iterations = 0;
  let forcedTents = 0;
  let removedCandidates = 0;
  let contradiction = false;

  while (changed) {
    changed = false;
    iterations++;

    // --------------------------------------------------
    // 1. Перевіряємо кандидатів і прибираємо ті,
    //    що знаходяться у вже заповнених рядках/стовпцях.
    //
    //    Підтверджений намет залишаємо кандидатом:
    //    ми ще можемо не знати, якому дереву він належить.
    // --------------------------------------------------

    for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
      if (resolvedTents[treeIndex] !== null) {
        continue;
      }

      candidates[treeIndex] = candidates[treeIndex].filter(([row, col]) => {
        const key = `${row},${col}`;

        if (tentSet.has(key)) {
          return true;
        }

        if (remainingRows[row] === 0) {
          removedCandidates++;
          changed = true;
          return false;
        }

        if (remainingCols[col] === 0) {
          removedCandidates++;
          changed = true;
          return false;
        }

        return true;
      });

      if (candidates[treeIndex].length === 0) {
        contradiction = true;
        break;
      }
    }

    // --------------------------------------------------
    // 2. Якщо дерево має одного кандидата —
    //    перевіряємо, чи тільки це дерево претендує
    //    на цю клітинку.
    //
    //    Якщо клітинка вже підтверджена як намет,
    //    пару дерево → намет можна визначити.
    //
    //    Якщо клітинка ще не підтверджена,
    //    вона стає наметом тільки тоді,
    //    коли це єдиний кандидат для цього дерева
    //    і єдиний претендент на цю клітинку.
    // --------------------------------------------------

    for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
      if (resolvedTents[treeIndex] !== null) {
        continue;
      }

      if (candidates[treeIndex].length !== 1) {
        continue;
      }

      const [row, col] = candidates[treeIndex][0];
      const key = `${row},${col}`;

      // Якщо клітинка вже підтверджена як намет,
      // визначаємо відповідну пару.
      if (tentSet.has(key)) {
        resolvedTents[treeIndex] = [row, col];
        changed = true;
        continue;
      }

      // Перевіряємо, скільки невирішених дерев
      // претендують на цю клітинку.
      const owners = getCandidateOwners(candidates, resolvedTents, row, col);

      // Якщо претендентів більше одного,
      // пару поки визначати не можна.
      if (owners.length !== 1) {
        continue;
      }

      // Перевіряємо, чи цей намет уже призначений
      // іншому дереву.
      const resolvedOwner = resolvedTents.findIndex(
        (tent) => tent !== null && tent[0] === row && tent[1] === col,
      );

      if (resolvedOwner !== -1 && resolvedOwner !== treeIndex) {
        contradiction = true;
        break;
      }

      // Це єдиний претендент.
      // Отже, клітинка гарантовано є наметом
      // і пара дерево → намет також визначена.
      resolvedTents[treeIndex] = [row, col];

      tents.push([row, col]);
      tentSet.add(key);

      remainingRows[row]--;
      remainingCols[col]--;

      if (remainingRows[row] < 0 || remainingCols[col] < 0) {
        contradiction = true;
        break;
      }

      forcedTents++;
      changed = true;
    }

    // --------------------------------------------------
    // 3. Рядки:
    //    якщо кількість різних кандидатів дорівнює
    //    кількості ще потрібних наметів,
    //    усі ці клітинки є наметами.
    // --------------------------------------------------

    for (let row = 0; row < size; row++) {
      if (remainingRows[row] <= 0) {
        continue;
      }

      const rowCells = getUniqueRowCandidates(candidates, resolvedTents, row);

      if (rowCells.length < remainingRows[row]) {
        contradiction = true;
        break;
      }

      if (rowCells.length !== remainingRows[row]) {
        continue;
      }

      for (const [candidateRow, candidateCol] of rowCells) {
        const key = `${candidateRow},${candidateCol}`;

        if (tentSet.has(key)) {
          continue;
        }

        tents.push([candidateRow, candidateCol]);
        tentSet.add(key);

        remainingRows[candidateRow]--;
        remainingCols[candidateCol]--;

        if (
          remainingRows[candidateRow] < 0 ||
          remainingCols[candidateCol] < 0
        ) {
          contradiction = true;
          break;
        }

        forcedTents++;
        changed = true;
      }

      if (contradiction) {
        break;
      }
    }

    if (contradiction) {
      break;
    }

    // --------------------------------------------------
    // 4. Стовпці — аналогічно.
    // --------------------------------------------------

    for (let col = 0; col < size; col++) {
      if (remainingCols[col] <= 0) {
        continue;
      }

      const colCells = getUniqueColCandidates(candidates, resolvedTents, col);

      if (colCells.length < remainingCols[col]) {
        contradiction = true;
        break;
      }

      if (colCells.length !== remainingCols[col]) {
        continue;
      }

      for (const [candidateRow, candidateCol] of colCells) {
        const key = `${candidateRow},${candidateCol}`;

        if (tentSet.has(key)) {
          continue;
        }

        tents.push([candidateRow, candidateCol]);
        tentSet.add(key);

        remainingRows[candidateRow]--;
        remainingCols[candidateCol]--;

        if (
          remainingRows[candidateRow] < 0 ||
          remainingCols[candidateCol] < 0
        ) {
          contradiction = true;
          break;
        }

        forcedTents++;
        changed = true;
      }

      if (contradiction) {
        break;
      }
    }

    if (contradiction) {
      break;
    }

    // --------------------------------------------------
    // 5. Видаляємо кандидатів:
    //
    //    - із заповнених рядків;
    //    - із заповнених стовпців;
    //    - із клітинок, сусідніх до наметів.
    //
    //    Сам підтверджений намет НЕ видаляємо.
    // --------------------------------------------------

    for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
      if (resolvedTents[treeIndex] !== null) {
        continue;
      }

      candidates[treeIndex] = candidates[treeIndex].filter(([row, col]) => {
        const key = `${row},${col}`;

        // Кандидат не може бути наметом,
        // який уже визначений за іншим деревом.
        const resolvedOwner = resolvedTents.findIndex(
          (tent) => tent !== null && tent[0] === row && tent[1] === col,
        );

        if (resolvedOwner !== -1 && resolvedOwner !== treeIndex) {
          removedCandidates++;
          changed = true;
          return false;
        }

        // Підтверджений намет цього дерева
        // залишається кандидатом.
        if (tentSet.has(key)) {
          return true;
        }

        if (remainingRows[row] === 0) {
          removedCandidates++;
          changed = true;
          return false;
        }

        if (remainingCols[col] === 0) {
          removedCandidates++;
          changed = true;
          return false;
        }

        // Кандидат не може бути поруч
        // з уже підтвердженим наметом.
        for (const [tentRow, tentCol] of tents) {
          if (row === tentRow && col === tentCol) {
            continue;
          }

          if (Math.abs(row - tentRow) <= 1 && Math.abs(col - tentCol) <= 1) {
            removedCandidates++;
            changed = true;
            return false;
          }
        }

        return true;
      });
    }
  }
  // --------------------------------------------------
  // Перевіряємо, чи не залишилося дерево без кандидатів.
  // --------------------------------------------------

  for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
    if (resolvedTents[treeIndex] !== null) {
      continue;
    }

    if (candidates[treeIndex].length === 0) {
      contradiction = true;
      break;
    }
  }

  // --------------------------------------------------
  // 6. Остаточна перевірка.
  //
  // Якщо рядок або стовпець ще потребує намет,
  // але відповідних кандидатів немає — суперечність.
  // --------------------------------------------------

  for (let row = 0; row < size; row++) {
    if (remainingRows[row] < 0) {
      contradiction = true;
      break;
    }
  }

  if (!contradiction) {
    for (let col = 0; col < size; col++) {
      if (remainingCols[col] < 0) {
        contradiction = true;
        break;
      }
    }
  }

  state.contradiction = contradiction;
  state.statistics.iterations += iterations;
  state.statistics.forcedTents += forcedTents;
  state.statistics.removedCandidates += removedCandidates;

  return state;
}

/**
 * Повертає унікальні клітинки-кандидати
 * певного рядка.
 */
function getUniqueRowCandidates(candidates, resolvedTents, row) {
  const result = [];
  const seen = new Set();

  for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
    if (resolvedTents[treeIndex] !== null) {
      continue;
    }

    for (const [candidateRow, candidateCol] of candidates[treeIndex]) {
      if (candidateRow !== row) {
        continue;
      }

      const key = `${candidateRow},${candidateCol}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      result.push([candidateRow, candidateCol]);
    }
  }

  return result;
}

function getUniqueColCandidates(candidates, resolvedTents, col) {
  const result = [];
  const seen = new Set();

  for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
    if (resolvedTents[treeIndex] !== null) {
      continue;
    }

    for (const [candidateRow, candidateCol] of candidates[treeIndex]) {
      if (candidateCol !== col) {
        continue;
      }

      const key = `${candidateRow},${candidateCol}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      result.push([candidateRow, candidateCol]);
    }
  }

  return result;
}

function getCandidateOwners(candidates, resolvedTents, row, col) {
  const owners = [];

  for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
    // Вирішені дерева більше не враховуємо.
    if (resolvedTents[treeIndex] !== null) {
      continue;
    }

    if (
      candidates[treeIndex].some(
        ([candidateRow, candidateCol]) =>
          candidateRow === row && candidateCol === col,
      )
    ) {
      owners.push(treeIndex);
    }
  }

  return owners;
}

function canMatchTrees(candidates, resolvedTrees) {
  const unresolvedTrees = [];

  for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
    if (resolvedTrees.has(treeIndex)) {
      continue;
    }

    if (candidates[treeIndex].length === 0) {
      return false;
    }

    unresolvedTrees.push(treeIndex);
  }

  const tentOwner = new Map();

  function tryMatch(treeIndex, visited) {
    for (const [row, col] of candidates[treeIndex]) {
      const key = `${row},${col}`;

      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      const previousTree = tentOwner.get(key);

      if (previousTree === undefined || tryMatch(previousTree, visited)) {
        tentOwner.set(key, treeIndex);
        return true;
      }
    }

    return false;
  }

  for (const treeIndex of unresolvedTrees) {
    if (!tryMatch(treeIndex, new Set())) {
      return false;
    }
  }

  return true;
}
function findTreeTentMatching(initialCandidates, tents, resolvedTents) {
  const tentSet = new Set(tents.map(([row, col]) => `${row},${col}`));

  const usedTents = new Set();

  // Результат: для кожного дерева його намет.
  const assignment = resolvedTents.map((tent) =>
    tent === null ? null : [...tent],
  );

  // --------------------------------------------------
  // 1. Перевіряємо вже визначені пари.
  // --------------------------------------------------

  for (let treeIndex = 0; treeIndex < resolvedTents.length; treeIndex++) {
    const tent = resolvedTents[treeIndex];

    if (tent === null) {
      continue;
    }

    const [row, col] = tent;
    const key = `${row},${col}`;

    // Визначений намет повинен входити
    // до множини підтверджених наметів.
    if (!tentSet.has(key)) {
      return null;
    }

    // Один намет не може належати двом деревам.
    if (usedTents.has(key)) {
      return null;
    }

    // І цей намет повинен бути початковим
    // кандидатом саме цього дерева.
    const isCandidate = initialCandidates[treeIndex].some(
      ([candidateRow, candidateCol]) =>
        candidateRow === row && candidateCol === col,
    );

    if (!isCandidate) {
      return null;
    }

    usedTents.add(key);
  }

  // --------------------------------------------------
  // 2. Формуємо список невизначених дерев
  //    і можливих для них підтверджених наметів.
  // --------------------------------------------------

  const unresolved = [];

  for (let treeIndex = 0; treeIndex < initialCandidates.length; treeIndex++) {
    if (resolvedTents[treeIndex] !== null) {
      continue;
    }

    const possibleTents = initialCandidates[treeIndex].filter(([row, col]) => {
      const key = `${row},${col}`;

      return tentSet.has(key) && !usedTents.has(key);
    });

    // У цього дерева немає жодного можливого
    // підтвердженого намету.
    if (possibleTents.length === 0) {
      return null;
    }

    unresolved.push({
      treeIndex,
      candidates: possibleTents,
    });
  }

  // --------------------------------------------------
  // 3. Спочатку розглядаємо дерева з найменшою
  //    кількістю можливих наметів.
  // --------------------------------------------------

  unresolved.sort((a, b) => a.candidates.length - b.candidates.length);

  // --------------------------------------------------
  // 4. Backtracking.
  // --------------------------------------------------

  function search(index) {
    if (index === unresolved.length) {
      return true;
    }

    const { treeIndex, candidates } = unresolved[index];

    for (const [row, col] of candidates) {
      const key = `${row},${col}`;

      if (usedTents.has(key)) {
        continue;
      }

      usedTents.add(key);
      assignment[treeIndex] = [row, col];

      if (search(index + 1)) {
        return true;
      }

      assignment[treeIndex] = null;
      usedTents.delete(key);
    }

    return false;
  }

  if (!search(0)) {
    return null;
  }

  return assignment;
}

function compareMatchingWithSolution(matching, solution) {
  const solutionSet = new Set();

  for (let row = 0; row < solution.length; row++) {
    for (let col = 0; col < solution[row].length; col++) {
      if (solution[row][col] === "A") {
        solutionSet.add(`${row},${col}`);
      }
    }
  }

  const matchingSet = new Set(matching.map(([row, col]) => `${row},${col}`));

  if (solutionSet.size !== matchingSet.size) {
    return false;
  }

  for (const key of solutionSet) {
    if (!matchingSet.has(key)) {
      return false;
    }
  }

  return true;
}

/*
 * ----------- Перевірка одного припущення ------------------------
 */
function testAssumption(puzzle, candidates, treeIndex, tent) {
  const state = createSolverState(puzzle, candidates);
  return reduceCandidates(puzzle, state, [
    {
      treeIndex,
      tent,
    },
  ]);
}

function testTreeCandidates(puzzle, candidates, treeIndex) {
  const results = [];

  for (const tent of candidates[treeIndex]) {
    const result = testAssumption(puzzle, candidates, treeIndex, tent);

    results.push({
      tent,
      contradiction: result.contradiction,
      result,
    });
  }

  return results;
}

function filterByAssumptions(puzzle, candidates, treeIndex) {
  const possible = [];

  for (const tent of candidates[treeIndex]) {
    const result = testAssumption(puzzle, candidates, treeIndex, tent);

    if (!result.contradiction) {
      possible.push(tent);
    }
  }
  return possible;
}
function filterAllCandidates(puzzle, candidates) {
  const result = candidates.map((treeCandidates) =>
    treeCandidates.map(([row, col]) => [row, col]),
  );

  for (let treeIndex = 0; treeIndex < candidates.length; treeIndex++) {
    // Якщо дерево вже не має альтернатив,
    // перевіряти його немає сенсу.
    if (candidates[treeIndex].length <= 1) {
      continue;
    }

    const possible = filterByAssumptions(puzzle, candidates, treeIndex);

    result[treeIndex] = possible;
  }

  return result;
}

function reduceByAssumptions(puzzle, candidates) {
  let current = candidates;

  while (true) {
    const next = filterAllCandidates(puzzle, current);

    // Якщо якийсь список кандидатів спорожнів —
    // отримали суперечність.
    if (next.some((treeCandidates) => treeCandidates.length === 0)) {
      return {
        candidates: next,
        contradiction: true,
      };
    }

    const changed = next.some(
      (treeCandidates, treeIndex) =>
        treeCandidates.length !== current[treeIndex].length,
    );

    if (!changed) {
      return {
        candidates: next,
        contradiction: false,
      };
    }

    current = next;
  }
}

function isSolved(candidates) {
  return candidates.every((treeCandidates) => treeCandidates.length === 1);
}

function countSolutions(puzzle, candidates) {
  let solutionCount = 0;

  function search(currentCandidates) {
    // Якщо вже знайшли два розв'язки,
    // більше шукати не потрібно.
    if (solutionCount >= 2) {
      return;
    }

    // Спочатку максимально скорочуємо кандидати.
    const result = reduceByAssumptions(puzzle, currentCandidates);

    if (result.contradiction) {
      return;
    }

    const reduced = result.candidates;

    // Усі дерева визначені — знайшли розв'язок.
    if (isSolved(reduced)) {
      solutionCount++;
      return;
    }

    // Вибираємо дерево з найменшою кількістю кандидатів.
    let treeIndex = -1;
    let minCandidates = Infinity;

    for (let i = 0; i < reduced.length; i++) {
      const count = reduced[i].length;

      if (count > 1 && count < minCandidates) {
        minCandidates = count;
        treeIndex = i;
      }
    }

    // Теоретично сюди потрапляти не повинні.
    if (treeIndex === -1) {
      return;
    }

    // Перебираємо кандидати цього дерева.
    for (const tent of reduced[treeIndex]) {
      const nextCandidates = reduced.map((treeCandidates) =>
        treeCandidates.map(([row, col]) => [row, col]),
      );

      nextCandidates[treeIndex] = [tent];

      search(nextCandidates);

      // Другого розв'язку вже достатньо.
      if (solutionCount >= 2) {
        return;
      }
    }
  }

  search(candidates);

  return solutionCount;
}

function hasUniqueSolution(puzzle) {
  const candidates = getTentCandidates(puzzle);

  return countSolutions(puzzle, candidates) === 1;
}

//=======================================================

// --------------------------------------------------
// Запуск генератора
// --------------------------------------------------

generatePuzzle(8);
