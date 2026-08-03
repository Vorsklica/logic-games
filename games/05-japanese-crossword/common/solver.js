/**
 * Знаходить кількість розв'язків японського кросворду.
 *
 * На основі підказок генерує всі допустимі патерни рядків і стовпців,
 * після чого рекурсивно перебирає можливі комбінації рядків.
 *
 * @param {{rows:number[][], cols:number[][]}} hints Підказки рядків і стовпців.
 * @returns {number} Кількість знайдених розв'язків.
 */

export function solve(hints) {
  const height = hints.rows.length;
  const width = hints.cols.length;

  // Робочий bitmap.
  const bitmap = Array.from({ length: height }, () => new Array(width).fill(0));

  // Усі можливі патерни рядків.
  const rowPatterns = hints.rows.map((hint) => generatePatterns(hint, width));

  // Усі можливі патерни стовпців.
  const columnPatterns = hints.cols.map((hint) =>
    generatePatterns(hint, height),
  );

  // Лічильник знайдених розв'язків.
  let solutionCount = 0;

  /**
   * Рекурсивно перебирає всі допустимі патерни рядків.
   *
   * @param {number} row Номер поточного рядка.
   */
  function search(row) {
    // Усі рядки заповнені — знайдено один розв'язок.
    if (row === height) {
      solutionCount++;
      return;
    }

    // Перебираємо всі патерни поточного рядка.
    for (const pattern of rowPatterns[row]) {
      bitmap[row] = pattern;

      if (isCompatible(bitmap, row, columnPatterns)) {
        search(row + 1);
      }
    }
  }

  search(0);

  return solutionCount;
}

/**
 * Генерує всі допустимі патерни для рядка або стовпця.
 *
 * @param {number[]} hint Масив довжин груп.
 * @param {number} length Довжина рядка (або стовпця).
 * @returns {number[][]} Масив усіх допустимих патернів.
 */
function generatePatterns(hint, length) {
  const patterns = [];

  // Особливий випадок — порожня підказка.
  if (hint.length === 0) {
    patterns.push(new Array(length).fill(0));
    return patterns;
  }

  const pattern = new Array(length).fill(0);

  buildPattern(0, 0);

  return patterns;

  /**
   * Рекурсивно розміщує групи.
   *
   * @param {number} groupIndex Номер поточної групи.
   * @param {number} startPos Перша позиція, з якої можна починати пошук.
   */
  function buildPattern(groupIndex, startPos) {
    const groupLength = hint[groupIndex];

    // Мінімальна довжина, необхідна для всіх наступних груп.
    let remainingLength = 0;

    for (let i = groupIndex + 1; i < hint.length; i++) {
      remainingLength += hint[i] + 1;
    }

    const lastStart = length - groupLength - remainingLength;

    for (let position = startPos; position <= lastStart; position++) {
      // Встановлюємо поточну групу.
      for (let i = 0; i < groupLength; i++) {
        pattern[position + i] = 1;
      }

      if (groupIndex === hint.length - 1) {
        // Остання група — зберігаємо готовий патерн.
        patterns.push([...pattern]);
      } else {
        // Наступна група повинна починатися мінімум через одну клітинку.
        buildPattern(groupIndex + 1, position + groupLength + 1);
      }

      // Прибираємо поточну групу перед наступною ітерацією.
      for (let i = 0; i < groupLength; i++) {
        pattern[position + i] = 0;
      }
    }
  }
}

/**
 * Перевіряє, чи існує хоча б один допустимий патерн стовпця,
 * який збігається з уже заповненою частиною bitmap.
 *
 * @param {number[][]} bitmap Поточний bitmap.
 * @param {number} currentRow Номер останнього заповненого рядка.
 * @param {number[][]} patterns Усі допустимі патерни цього стовпця.
 * @param {number} column Номер стовпця.
 * @returns {boolean} true, якщо знайдено хоча б один сумісний патерн.
 */
function isColumnCompatible(bitmap, currentRow, patterns, column) {
  for (const pattern of patterns) {
    let match = true;

    for (let row = 0; row <= currentRow; row++) {
      if (bitmap[row][column] !== pattern[row]) {
        match = false;
        break;
      }
    }

    if (match) {
      return true;
    }
  }

  return false;
}

/**
 * Перевіряє, чи сумісний поточний стан bitmap з підказками стовпців.
 *
 * Для кожного стовпця викликає isColumnCompatible(). Якщо хоча б один
 * стовпець не може бути добудований до правильного розв'язку, функція
 * негайно повертає false.
 *
 * @param {number[][]} bitmap Поточний робочий bitmap.
 * @param {number} currentRow Номер останнього заповненого рядка.
 * @param {number[][][]} columnPatterns Масив патернів для всіх стовпців.
 * @returns {boolean} true, якщо всі стовпці сумісні.
 */
function isCompatible(bitmap, currentRow, columnPatterns) {
  for (let column = 0; column < columnPatterns.length; column++) {
    if (
      !isColumnCompatible(bitmap, currentRow, columnPatterns[column], column)
    ) {
      return false;
    }
  }

  return true;
}
