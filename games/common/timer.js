export function createTimer(elementId) {
  const element = document.getElementById(elementId);

  let elapsed = 0;
  let startTime = null;
  let intervalId = null;

  function getElapsed() {
    if (startTime === null) {
      return elapsed;
    }

    return elapsed + (Date.now() - startTime);
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }

  function update() {
    element.textContent = formatTime(getElapsed());
  }

  function start() {
    if (startTime !== null) {
      return;
    }

    startTime = Date.now();

    update();

    intervalId = setInterval(update, 1000);
  }

  function stop() {
    if (startTime === null) {
      return;
    }

    elapsed = getElapsed();
    startTime = null;

    clearInterval(intervalId);
    intervalId = null;

    update();
  }

  function reset() {
    stop();

    elapsed = 0;

    update();
  }

  function setElapsed(milliseconds) {
    stop();

    elapsed = milliseconds;

    update();
  }

  return {
    start,
    stop,
    reset,
    getElapsed,
    setElapsed,
  };
}
