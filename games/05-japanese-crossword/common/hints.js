/**
 * Будує підказки для японського кросворду.
 *
 * @param {number[][]} bitmap Двовимірний масив клітинок (0 або 1).
 * @returns {{rows:number[][], cols:number[][]}}
 */
export function generateHints(bitmap) {
  const rowCount = bitmap.length;
  const colCount = bitmap[0].length;

  const rows = [];

  for (let row = 0; row < rowCount; row++) {
    rows.push(generateLineHint(bitmap[row]));
  }

  const cols = [];

  for (let col = 0; col < colCount; col++) {
    const column = [];

    for (let row = 0; row < rowCount; row++) {
      column.push(bitmap[row][col]);
    }

    cols.push(generateLineHint(column));
  }

  return {
    rows,
    cols,
  };
}

/**
 * Будує підказку для одного рядка або стовпця.
 *
 * @param {number[]} line Масив клітинок (0 або 1).
 * @returns {number[]} Масив довжин груп зафарбованих клітинок.
 */
function generateLineHint(line) {
  const groups = [];
  let count = 0;

  for (const cell of line) {
    if (cell === 1) {
      count++;
    } else if (count > 0) {
      groups.push(count);
      count = 0;
    }
  }

  if (count > 0) {
    groups.push(count);
  }

  return groups;
}
