export function initSwipe(element, onSwipe) {
  let startX = 0;
  let startY = 0;

  const minDistance = 30;

  element.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];

      startX = touch.clientX;
      startY = touch.clientY;
    },
    { passive: true },
  );

  element.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Занадто короткий рух — це не свайп
      if (Math.max(absX, absY) < minDistance) {
        return;
      }

      let direction;

      if (absX > absY) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      onSwipe(direction);
    },
    { passive: true },
  );
}
