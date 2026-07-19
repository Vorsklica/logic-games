/**
 * Спільні функції для роботи з параметрами URL.
 * Використовуються всіма іграми платформи Logic Games.
 */

/**
 * Повертає номер набору завдань із URL.
 * Якщо параметр відсутній або некоректний,
 * повертає значення за замовчуванням.
 */
export function getSet(defaultSet = 1) {
  const params = new URLSearchParams(window.location.search);

  const value = Number(params.get("set"));

  if (!Number.isInteger(value) || value < 1) {
    return defaultSet;
  }

  return value;
}
