import { getDataFolder } from "../common/url.js";

const gameState = {
  originalImage: null,
  modifiedImage: null,
  maskImage: null,
  regions: [],
  boundingBoxes: [],
  boundaries: [],
  foundRegions: [],
  gameOver: false,
  clickLocked: false,
  startTime: null,
  timerInterval: null,
};
const gameProgress = document.getElementById("gameProgress");
const gameTimer = document.getElementById("gameTimer");

async function loadGameData() {
  const dataFolder = getDataFolder();
  const basePath = `./content/${dataFolder}/`;

  gameState.originalImage = `${basePath}original.jpg`;
  gameState.modifiedImage = `${basePath}modified.jpg`;

  gameState.maskImage = await loadImage(`${basePath}mask.png`);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Не вдалося завантажити ${src}`));

    image.src = src;
  });
}

function displayImages() {
  document.getElementById("originalImage").src = gameState.originalImage;
  document.getElementById("modifiedImage").src = gameState.modifiedImage;
}

async function initGame() {
  await loadGameData();
  displayImages();
  initClickHandling();
  const maskData = getMaskPixels();
  const regions = findRegions(maskData);
  const boxes = regions.map((region) => getBoundingBox(region));
  gameState.regions = regions;
  gameState.boundingBoxes = regions.map((region) => getBoundingBox(region));

  console.log("Number of regions:", gameState.regions.length);
  console.log("Bounding boxes:", gameState.boundingBoxes);

  gameState.boundaries = regions.map((region) =>
    findBoundaryPixels(region, maskData.width, maskData.height),
  );

  console.log("Boundary pixels:", gameState.boundaries);
  updateProgress(); //Кількість знайдених відмінностей
  startTimer();
}

function getMaskPixels() {
  const width = gameState.maskImage.naturalWidth;
  const height = gameState.maskImage.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  context.drawImage(gameState.maskImage, 0, 0);

  return context.getImageData(0, 0, width, height);
}

function findRegions(maskData) {
  const width = maskData.width;
  const height = maskData.height;
  const pixels = maskData.data;

  const visited = new Uint8Array(width * height);
  const regions = [];

  function isWhite(x, y) {
    const index = (y * width + x) * 4;

    return (
      pixels[index] === 255 &&
      pixels[index + 1] === 255 &&
      pixels[index + 2] === 255
    );
  }

  function getPixelIndex(x, y) {
    return y * width + x;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = getPixelIndex(x, y);

      if (visited[pixelIndex] || !isWhite(x, y)) {
        continue;
      }

      const region = [];
      const queue = [[x, y]];

      visited[pixelIndex] = 1;

      while (queue.length > 0) {
        const [currentX, currentY] = queue.shift();

        region.push([currentX, currentY]);

        const neighbors = [
          [currentX - 1, currentY],
          [currentX + 1, currentY],
          [currentX, currentY - 1],
          [currentX, currentY + 1],
        ];

        for (const [nextX, nextY] of neighbors) {
          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            continue;
          }

          const nextIndex = getPixelIndex(nextX, nextY);

          if (!visited[nextIndex] && isWhite(nextX, nextY)) {
            visited[nextIndex] = 1;
            queue.push([nextX, nextY]);
          }
        }
      }

      regions.push(region);
    }
  }

  return regions;
}

function getBoundingBox(region) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of region) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function findBoundaryPixels(region, width, height) {
  const regionSet = new Set();

  for (const [x, y] of region) {
    regionSet.add(`${x},${y}`);
  }

  const boundary = [];

  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [x, y] of region) {
    let isBoundary = false;

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;

      // Піксель біля краю зображення
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        isBoundary = true;
        break;
      }

      // Сусід не належить цій області
      if (!regionSet.has(`${nx},${ny}`)) {
        isBoundary = true;
        break;
      }
    }

    if (isBoundary) {
      boundary.push([x, y]);
    }
  }

  return boundary;
}

function buildBoundaryPath(region) {
  const regionSet = new Set();

  for (const [x, y] of region) {
    regionSet.add(`${x},${y}`);
  }

  const segments = [];

  function hasPixel(x, y) {
    return regionSet.has(`${x},${y}`);
  }

  for (const [x, y] of region) {
    // Верхня сторона
    if (!hasPixel(x, y - 1)) {
      segments.push([
        [x, y],
        [x + 1, y],
      ]);
    }

    // Права сторона
    if (!hasPixel(x + 1, y)) {
      segments.push([
        [x + 1, y],
        [x + 1, y + 1],
      ]);
    }

    // Нижня сторона
    if (!hasPixel(x, y + 1)) {
      segments.push([
        [x + 1, y + 1],
        [x, y + 1],
      ]);
    }

    // Ліва сторона
    if (!hasPixel(x - 1, y)) {
      segments.push([
        [x, y + 1],
        [x, y],
      ]);
    }
  }

  return segments;
}

function orderBoundarySegments(segments) {
  if (segments.length === 0) {
    return [];
  }

  const pointKey = ([x, y]) => `${x},${y}`;

  const nextPoints = new Map();

  for (const [start, end] of segments) {
    nextPoints.set(pointKey(start), end);
  }

  const path = [];

  let current = segments[0][0];
  const start = [...current];

  do {
    path.push([...current]);

    const next = nextPoints.get(pointKey(current));

    if (!next) {
      break;
    }

    current = next;
  } while (current[0] !== start[0] || current[1] !== start[1]);

  return path;
}

function showBoundaries(regions) {
  const container = document.querySelector(".game__image-container");

  const image = document.getElementById("originalImage");

  const canvas = document.createElement("canvas");

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";

  const context = canvas.getContext("2d");

  for (const region of regions) {
    const segments = buildBoundaryPath(region);
    const points = orderBoundarySegments(segments);

    drawBoundary(context, points);
  }

  container.appendChild(canvas);
}

function drawBoundary(context, points) {
  if (points.length < 3) {
    return;
  }

  const simplified = simplifyPath(points, 2);

  const path = new Path2D();

  path.moveTo(simplified[0][0], simplified[0][1]);

  for (let i = 1; i < simplified.length; i++) {
    path.lineTo(simplified[i][0], simplified[i][1]);
  }

  path.closePath();

  context.strokeStyle = "black";
  context.lineWidth = 6;
  context.stroke(path);

  context.strokeStyle = "red";
  context.lineWidth = 3;
  context.stroke(path);
}

function simplifyPath(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let maxIndex = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end);

    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);

    const right = simplifyPath(points.slice(maxIndex), tolerance);

    return left.slice(0, -1).concat(right);
  }

  return [start, end];
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1);
  }

  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / Math.hypot(dx, dy);
}
function getImageCoordinates(event, image) {
  const rect = image.getBoundingClientRect();

  const x = Math.floor(
    ((event.clientX - rect.left) * image.naturalWidth) / rect.width,
  );

  const y = Math.floor(
    ((event.clientY - rect.top) * image.naturalHeight) / rect.height,
  );

  return { x, y };
}

function findRegionAt(x, y) {
  for (let i = 0; i < gameState.regions.length; i++) {
    const box = gameState.boundingBoxes[i];

    if (
      x < box.x ||
      x >= box.x + box.width ||
      y < box.y ||
      y >= box.y + box.height
    ) {
      continue;
    }

    for (const [px, py] of gameState.regions[i]) {
      if (px === x && py === y) {
        return i;
      }
    }
  }

  return -1;
}

function handleImageClick(event) {
  if (gameState.gameOver || gameState.clickLocked) return;

  const image = event.currentTarget;

  const { x, y } = getImageCoordinates(event, image);

  const regionIndex = findRegionAt(x, y);

  console.log(`Click: ${x}, ${y} → region: ${regionIndex}`);

  if (regionIndex !== -1) {
    if (!gameState.foundRegions.includes(regionIndex)) {
      gameState.foundRegions.push(regionIndex);

      console.log("Found region:", regionIndex);
      showRegionOnBothImages(regionIndex);
      updateProgress();

      if (gameState.foundRegions.length === gameState.regions.length) {
        showGameFinished();
      }
    }
  } else {
    showWrongClick(image, x, y);
  }
}

function initClickHandling() {
  document
    .getElementById("originalImage")
    .addEventListener("click", handleImageClick);

  document
    .getElementById("modifiedImage")
    .addEventListener("click", handleImageClick);
}
function getOverlayCanvas(image) {
  let canvas = image.parentElement.querySelector(".game__overlay");

  if (!canvas) {
    canvas = document.createElement("canvas");

    canvas.className = "game__overlay";

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    image.parentElement.style.position = "relative";
    image.parentElement.appendChild(canvas);
  }

  canvas.style.left = `${image.offsetLeft}px`;

  canvas.style.top = `${image.offsetTop}px`;
  canvas.style.width = `${image.offsetWidth}px`;
  canvas.style.height = `${image.offsetHeight}px`;

  return canvas;
}

function showRegion(image, regionIndex) {
  const canvas = getOverlayCanvas(image);
  const context = canvas.getContext("2d");

  const region = gameState.regions[regionIndex];

  const segments = buildBoundaryPath(region);
  const points = orderBoundarySegments(segments);

  drawBoundary(context, points);
}

function showRegionOnBothImages(regionIndex) {
  const region = gameState.regions[regionIndex];

  const segments = buildBoundaryPath(region);
  const points = orderBoundarySegments(segments);

  const originalImage = document.getElementById("originalImage");
  const modifiedImage = document.getElementById("modifiedImage");

  const originalCanvas = getOverlayCanvas(originalImage);
  const modifiedCanvas = getOverlayCanvas(modifiedImage);

  drawBoundary(originalCanvas.getContext("2d"), points);

  drawBoundary(modifiedCanvas.getContext("2d"), points);
}

function updateProgress() {
  gameProgress.textContent = `Знайдено: ${gameState.foundRegions.length} / ${gameState.regions.length}`;
}

function showGameFinished() {
  gameState.gameOver = true;
  stopTimer();

  gameStatus.innerHTML = `
  🎉 Вітаємо! Усі відмінності знайдено!
  <button class="game__restart" id="restartButton">🔄 Повторити</button>
`;

  document
    .getElementById("restartButton")
    .addEventListener("click", restartGame);
}

function showWrongClick(image, x, y) {
  gameState.clickLocked = true;

  const container = image.parentElement;

  const canvas = document.createElement("canvas");

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.style.left = `${image.offsetLeft}px`;
  canvas.style.top = `${image.offsetTop}px`;
  canvas.style.width = `${image.offsetWidth}px`;
  canvas.style.height = `${image.offsetHeight}px`;
  canvas.className = "game__wrong-click";
  /*  
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  container.style.position = "relative";
*/

  container.appendChild(canvas);

  const context = canvas.getContext("2d");

  context.font = "40px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText("❌", x, y);

  setTimeout(() => {
    canvas.remove();
    gameState.clickLocked = false;
  }, 500);
}

function startTimer() {
  gameState.startTime = Date.now();

  gameState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    gameTimer.textContent = `⏱ ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}
function stopTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerInterval = null;
}
function restartGame() {
  stopTimer();

  gameState.foundRegions = [];
  gameState.gameOver = false;
  gameState.clickLocked = false;

  document
    .querySelectorAll(".game__overlay, .game__wrong-click")
    .forEach((canvas) => canvas.remove());

  gameStatus.textContent = "";
  gameTimer.textContent = "⏱ 00:00";

  updateProgress();
  startTimer();
}
initGame();
