export function showConfirm({
  title = "Підтвердження",
  text = "",
  confirmText = "Так",
  cancelText = "Скасувати",
}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "game-confirm-overlay";

    const dialog = document.createElement("div");
    dialog.className = "game-confirm";

    if (title) {
      const titleElement = document.createElement("h2");
      titleElement.textContent = title;
      dialog.appendChild(titleElement);
    }

    if (text) {
      const textElement = document.createElement("p");
      textElement.textContent = text;
      dialog.appendChild(textElement);
    }

    const buttons = document.createElement("div");
    buttons.className = "game-confirm__buttons";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = cancelText;

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = confirmText;

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    cancelButton.addEventListener("click", () => {
      close(false);
    });

    confirmButton.addEventListener("click", () => {
      close(true);
    });

    buttons.appendChild(cancelButton);
    buttons.appendChild(confirmButton);

    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    cancelButton.focus();
  });
}
