const STORAGE_PREFIX = "gameState:";

/**
 * Формує ключ для localStorage.
 */
function getStorageKey(gameId) {
  return `${STORAGE_PREFIX}${gameId}`;
}

/**
 * Зберігає стан гри.
 */
export function saveGameState(gameId, state) {
  localStorage.setItem(getStorageKey(gameId), JSON.stringify(state));
}

/**
 * Завантажує стан гри.
 * Повертає null, якщо збереженого стану немає.
 */
export function loadGameState(gameId) {
  const saved = localStorage.getItem(getStorageKey(gameId));

  if (saved === null) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error(`Invalid saved state for game "${gameId}"`, error);
    return null;
  }
}

/**
 * Перевіряє, чи існує збережений стан гри.
 */
export function hasGameState(gameId) {
  return localStorage.getItem(getStorageKey(gameId)) !== null;
}

/**
 * Видаляє збережений стан гри.
 */
export function clearGameState(gameId) {
  localStorage.removeItem(getStorageKey(gameId));
}
