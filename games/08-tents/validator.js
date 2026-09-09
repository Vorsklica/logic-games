function validateCampGeneratorResult(jsonString) {
  let data;

  // Перевіряємо JSON
  try {
    data = JSON.parse(jsonString);
  } catch {
    return false;
  }

  // Перевіряємо наявність основних полів
  if (
    typeof data.width !== "number" ||
    typeof data.height !== "number" ||
    typeof data.trees !== "number" ||
    !Array.isArray(data.rowTents) ||
    !Array.isArray(data.columnTents) ||
    !Array.isArray(data.task) ||
    !Array.isArray(data.solution)
  ) {
    return false;
  }

  const { width, height } = data;

  // Перевіряємо розміри
  if (width <= 0 || height <= 0) {
    return false;
  }

  if (data.rowTents.length !== height) {
    return false;
  }

  if (data.columnTents.length !== width) {
    return false;
  }

  if (data.task.length !== height) {
    return false;
  }

  if (data.solution.length !== height) {
    return false;
  }

  for (let row = 0; row < height; row++) {
    if (data.task[row].length !== width) {
      return false;
    }

    if (data.solution[row].length !== width) {
      return false;
    }
  }

  // Знаходимо дерева
  const trees = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const value = data.task[row][col];

      if (value !== 0 && value !== 1) {
        return false;
      }

      if (value === 1) {
        trees.push([row, col]);
      }
    }
  }

  // Кількість дерев
  if (trees.length !== data.trees) {
    return false;
  }

  // Перевіряємо solution і збираємо намети
  const tents = [];

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const taskValue = data.task[row][col];
      const solutionValue = data.solution[row][col];

      // На місці дерева в solution теж має бути дерево
      if (taskValue === 1 && solutionValue !== 1) {
        return false;
      }

      // На порожньому місці не може бути дерева
      if (taskValue === 0 && solutionValue === 1) {
        return false;
      }

      // Допустимі значення solution
      if (solutionValue !== 0 && solutionValue !== 1 && solutionValue !== 2) {
        return false;
      }

      if (solutionValue === 2) {
        tents.push([row, col]);
      }
    }
  }

  // Кількість наметів повинна дорівнювати кількості дерев
  if (tents.length !== trees.length) {
    return false;
  }

  // Перевіряємо підказки рядків
  for (let row = 0; row < height; row++) {
    let count = 0;

    for (let col = 0; col < width; col++) {
      if (data.solution[row][col] === 2) {
        count++;
      }
    }

    if (count !== data.rowTents[row]) {
      return false;
    }
  }

  // Перевіряємо підказки стовпців
  for (let col = 0; col < width; col++) {
    let count = 0;

    for (let row = 0; row < height; row++) {
      if (data.solution[row][col] === 2) {
        count++;
      }
    }

    if (count !== data.columnTents[col]) {
      return false;
    }
  }

  // Намет не може торкатися іншого намету
  for (const [row, col] of tents) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) {
          continue;
        }

        const neighborRow = row + rowOffset;
        const neighborCol = col + colOffset;

        if (
          neighborRow >= 0 &&
          neighborRow < height &&
          neighborCol >= 0 &&
          neighborCol < width &&
          data.solution[neighborRow][neighborCol] === 2
        ) {
          return false;
        }
      }
    }
  }

  // Перевіряємо відповідність дерев і наметів.
  // Кожному дереву повинен відповідати унікальний сусідній намет.
  const tentOwners = new Map();

  function assignTree(treeIndex, usedTents) {
    const [treeRow, treeCol] = trees[treeIndex];

    const neighbors = [
      [treeRow - 1, treeCol],
      [treeRow + 1, treeCol],
      [treeRow, treeCol - 1],
      [treeRow, treeCol + 1],
    ];

    for (const [tentRow, tentCol] of neighbors) {
      if (tentRow < 0 || tentRow >= height || tentCol < 0 || tentCol >= width) {
        continue;
      }

      if (data.solution[tentRow][tentCol] !== 2) {
        continue;
      }

      const tentKey = `${tentRow},${tentCol}`;

      if (usedTents.has(tentKey)) {
        continue;
      }

      usedTents.add(tentKey);

      const owner = tentOwners.get(tentKey);

      if (owner === undefined) {
        tentOwners.set(tentKey, treeIndex);
        return true;
      }

      if (assignTree(owner, usedTents)) {
        tentOwners.set(tentKey, treeIndex);
        return true;
      }
    }

    return false;
  }

  for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
    const usedTents = new Set();

    if (!assignTree(treeIndex, usedTents)) {
      return false;
    }
  }

  return true;
}
const json = `{"width":7,"height":7,"trees":9,"rowTents":[2,2,1,1,2,1,0],"columnTents":[0,2,0,3,2,2,0],"task":[[0,0,1,0,1,0,1],[1,0,0,0,0,0,0],[0,0,1,0,0,1,0],[0,0,0,0,0,0,0],[0,0,0,0,1,0,0],[0,1,0,1,0,0,0],[0,0,0,0,0,0,0]],"solution":[[0,0,1,2,1,2,1],[1,2,0,0,2,0,0],[0,0,1,2,0,1,0],[0,0,0,0,0,2,0],[0,2,0,2,1,0,0],[0,1,0,1,2,0,0],[0,0,0,0,0,0,0]]}`;

console.log(validateCampGeneratorResult(json));
