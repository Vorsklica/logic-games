export function showMessage({
  title = "",
  text = "",
  buttonText = "Добре",
  onClose = null,
}) {
  // Створюємо затемнення
  const overlay = document.createElement("div");
  overlay.className = "game-message-overlay";

  // Створюємо вікно
  const message = document.createElement("div");
  message.className = "game-message";

  // Заголовок
  if (title) {
    const titleElement = document.createElement("h2");

    titleElement.textContent = title;

    message.appendChild(titleElement);
  }

  // Текст
  if (text) {
    const textElement = document.createElement("p");

    textElement.textContent = text;

    message.appendChild(textElement);
  }

  // Кнопка
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = buttonText;

  button.addEventListener("click", () => {
    overlay.remove();

    if (onClose) {
      onClose();
    }
  });

  message.appendChild(button);
  overlay.appendChild(message);
  document.body.appendChild(overlay);

  button.focus();
}
