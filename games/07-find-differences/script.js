import { getDataFolder } from "../common/url.js";

const gameState = {
  originalImage: null,
  modifiedImage: null,
  maskImage: null,
};

async function loadGameData() {
  const dataFolder = getDataFolder();
  const basePath = `./content/${dataFolder}/`;

  gameState.originalImage = `${basePath}original.jpg`;
  gameState.modifiedImage = `${basePath}modified.jpg`;
  gameState.maskImage = `${basePath}mask.png`;

  console.log("Game data:", gameState);
}

function displayImages() {
  document.getElementById("originalImage").src = gameState.originalImage;
  document.getElementById("modifiedImage").src = gameState.modifiedImage;
}

async function initGame() {
  await loadGameData();
  displayImages();
}

initGame();
