import { getDataFolder } from "../common/url.js";
import { generateHints } from "./common/hints.js";

const CELL_EMPTY = 0;
const CELL_FILLED = 1;
const CELL_CROSSED = 2;

const gameData = {
  title: "",
  width: 0,
  height: 0,

  bitmap: [],

  rowHints: [],
  columnHints: [],
};

const gameState = {
  playerBitmap: [],

  moves: 0,
  startTime: null,

  isCompleted: false,
};
