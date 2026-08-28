import config from "./config.js";
import { generateHints } from "../common/hints.js";
import { solve } from "../common/solver.js";
import {
  showSolutions,
  initializeSolutionViewer,
} from "../common/solutionViewer.js";
import {
  saveProjectHandle,
  loadProjectHandle,
  clearProjectHandle,
} from "./service/projectStorage.js";

const DEBUG = false;

if (DEBUG) {
}

const editorTitle = document.getElementById("editor_title");
const editorMassage = document.getElementById("editor_massage");
const editorDocumentSize = document.getElementById("editor_documentSize");
const editorBoard = document.getElementById("editor_board");
const editorButtonClear = document.getElementById("editor_buttonClear");
const editorButtonInvert = document.getElementById("editor_buttonInvert");
const editorButtonNew = document.getElementById("editor_buttonNew");
const editorButtonOpen = document.getElementById("editor_buttonOpen");
const editorButtonSave = document.getElementById("editor_buttonSave");
const editorButtonValidate = document.getElementById("editor_buttonValidate");
const editorButtonExport = document.getElementById("editor_buttonExport");
const editorDocumentName = document.getElementById("editor_documentName");
const editorStatusText = document.getElementById("editor_statusText");
const editorStatusSize = document.getElementById("editor_statusSize");
const editorRowHints = document.getElementById("editor_rowHints");
const editorColumnHints = document.getElementById("editor_columnHints");
const editorMessageText = document.getElementById("editor_messageText");
const editorMessage = document.getElementById("editor_message");
const editorDocumentTitle = document.getElementById("editor_documentTitle");
const editorCloseMessageButton = document.getElementById(
  "editor_closeMessageButton",
);

const documentState = {
  title: "",
  documentName: config.defaultDocumentName,
  width: config.width,
  height: config.height,
  bitmap: [],
  fileHandle: null,
  filePath: null,
};

const ROW = "row";
const COLUMN = "column";

let solutionCount = 0;

editorBoard.addEventListener("click", onBoardClick);
editorButtonClear.addEventListener("click", onButtonClearClick);
editorButtonInvert.addEventListener("click", onButtonInvertClick);
editorButtonNew.addEventListener("click", onButtonNewClick);
editorButtonSave.addEventListener("click", onButtonSaveClick);
editorButtonOpen.addEventListener("click", onButtonOpenClick);
editorButtonValidate.addEventListener("click", onButtonValidate);
editorCloseMessageButton.addEventListener("click", hideMessage);
editorButtonExport.addEventListener("click", exportDocument);
editorDocumentTitle.addEventListener("input", () => {
  documentState.title = editorDocumentTitle.value;
  setModified();
});

initialize();

function initialize() {
  editorTitle.textContent = `${documentState.title}`;
  editorDocumentSize.textContent = `${documentState.width} × ${documentState.height}`;
  editorDocumentTitle.value = documentState.title;
  createBitmap();

  createBoard();
  updateEditorInfo();
  initializeSolutionViewer();
}

function createBitmap() {
  documentState.bitmap = [];

  for (let row = 0; row < documentState.height; row++) {
    documentState.bitmap.push(new Array(documentState.width).fill(0));
  }
}

function createBoard() {
  editorBoard.innerHTML = "";

  editorBoard.style.gridTemplateColumns = `repeat(${documentState.width}, ${config.cellSize}px)`;
  for (let row = 0; row < documentState.height; row++) {
    for (let col = 0; col < documentState.width; col++) {
      const cell = document.createElement("div");

      cell.className = "editor__cell";

      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.style.width = `${config.cellSize}px`;
      cell.style.height = `${config.cellSize}px`;

      editorBoard.appendChild(cell);
    }
  }
}

function toggleCell(row, col) {
  documentState.bitmap[row][col] ^= 1;

  renderCell(row, col);
  setModified();
}

function renderCell(row, col) {
  const index = row * documentState.width + col;
  const cell = editorBoard.children[index];

  if (documentState.bitmap[row][col]) {
    cell.classList.add("editor__cell--filled");
  } else {
    cell.classList.remove("editor__cell--filled");
  }
}

function onBoardClick(event) {
  const cell = event.target;

  if (!cell.classList.contains("editor__cell")) {
    return;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  toggleCell(row, col);
  updateEditorInfo();
  updateHints();
  //printBitmap(); // Для тестування
}

function onButtonClearClick(event) {
  if (config.confirmClear) {
    if (!confirm("Очистити поле?")) {
      return;
    }
  }

  clearBitmap();
  updateEditorInfo();
  updateHints();
  renderBoard();
}

function clearBitmap() {
  createBitmap();
  setModified();
}

function invertBitmap() {
  for (let row = 0; row < documentState.height; row++) {
    for (let col = 0; col < documentState.width; col++) {
      documentState.bitmap[row][col] = 1 - documentState.bitmap[row][col];
    }
  }

  setModified();
}

function onButtonInvertClick(event) {
  invertBitmap();
  updateEditorInfo();
  renderBoard();
  updateHints();
  setModified();
}

function renderBoard() {
  for (let row = 0; row < documentState.height; row++) {
    for (let col = 0; col < documentState.width; col++) {
      renderCell(row, col);
    }
  }
}

function onButtonNewClick(event) {
  if (!canDiscardChanges()) {
    return;
  }

  newDocument();
}

function newDocument() {
  documentState.title = "";

  documentState.height = config.height;
  documentState.width = config.width;

  createBitmap();
  createBoard();
  renderBoard();
  updateHints();

  solutionCount = 0;

  documentState.documentName = config.defaultDocumentName;
  documentState.fileHandle = null;
  documentState.isModified = false;

  editorDocumentTitle.value = documentState.title;

  updateEditorInfo();
  updateExportButton();
}

/**
 * ========================================================
 *     Збереження документу
 ==========================================================*/
async function onButtonSaveClick(event) {
  await saveDocument();
}

async function saveDocument() {
  if (documentState.fileHandle === null) {
    const success = await saveDocumentAsFirst();

    if (!success) {
      return;
    }
  }

  await writeDocument();

  documentState.isModified = false;
  updateExportButton(); // Якщо solutionCount == 1, то кнопка Експорт роозблокована.
  updateEditorInfo();
}

async function saveDocumentAsFirst() {
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `${documentState.documentName}${config.defaultExtension}`,

      types: [
        {
          description: "Чернетки японських кросвордів",
          accept: {
            "application/json": [config.defaultExtension],
          },
        },
      ],
    });

    documentState.fileHandle = fileHandle;
    documentState.documentName = fileHandle.name;

    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      return false;
    }

    throw error;
  }
}

function createDocumentData() {
  return {
    title: documentState.title,
    width: documentState.width,
    height: documentState.height,
    bitmap: documentState.bitmap,
  };
}

async function writeDocument() {
  const documentData = createDocumentData();

  const json = JSON.stringify(documentData, null, 2);

  const writable = await documentState.fileHandle.createWritable();

  await writable.write(json);

  await writable.close();
}
/**
 *
 *          Відкриття файлу
 *
 */

async function onButtonOpenClick(event) {
  await openDocument();
}

async function openDocument() {
  if (!canDiscardChanges()) {
    return;
  }

  const fileHandle = await openDocumentDialog();

  if (fileHandle === null) {
    return;
  }

  const documentData = await readDocument(fileHandle);

  loadDocumentData(documentData, fileHandle);

  createBoard();
  renderBoard();
  updateEditorInfo();
  updateHints();
  updateExportButton();
}

async function openDocumentDialog() {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Чернетки японських кросвордів",
          accept: {
            "application/json": [config.defaultExtension],
          },
        },
      ],
      multiple: false,
    });

    return fileHandle;
  } catch (error) {
    if (error.name === "AbortError") {
      return null;
    }

    throw error;
  }
}

async function readDocument(fileHandle) {
  const file = await fileHandle.getFile();

  const text = await file.text();

  return JSON.parse(text);
}

function loadDocumentData(documentData, fileHandle) {
  documentState.title = documentData.title;
  documentState.width = documentData.width;
  documentState.height = documentData.height;

  documentState.bitmap = documentData.bitmap;

  documentState.documentName = fileHandle.name;
  documentState.fileHandle = fileHandle;
  documentState.isModified = false;

  editorDocumentTitle.value = documentState.title;
}
/*=========================================================*/

function printBitmap() {
  console.clear();

  console.log(documentState.bitmap.join("\n"));
}

function setModified() {
  documentState.isModified = true;
  updateExportButton();
}

function canDiscardChanges() {
  if (!documentState.isModified) {
    return true;
  }

  return confirm("Поточний документ містить незбережені зміни.\n\nПродовжити?");
}

function updateEditorInfo() {
  editorStatusSize.textContent = `${documentState.width} × ${documentState.height}`;

  editorDocumentName.textContent = documentState.documentName;

  editorStatusText.textContent = documentState.isModified
    ? "Документ змінено"
    : "Готово";
}

function renderHints(hints) {
  editorRowHints.replaceChildren();
  editorColumnHints.replaceChildren();

  for (const hint of hints.rows) {
    editorRowHints.append(createHintElement(hint, ROW));
  }

  for (const hint of hints.cols) {
    editorColumnHints.append(createHintElement(hint, COLUMN));
  }
}

/**
 * Створює DOM-елемент підказки.
 *
 * @param {number[]} hint Масив чисел підказки.
 * @param {string} orientation ROW або COLUMN.
 * @returns {HTMLDivElement}
 */
function createHintElement(hint, orientation) {
  const element = document.createElement("div");

  if (orientation === ROW) {
    element.className = "editor__rowHint";
  } else {
    element.className = "editor__columnHint";
  }

  for (const value of hint) {
    const span = document.createElement("span");
    span.textContent = value;
    element.append(span);
  }

  return element;
}

function updateHints() {
  const hints = generateHints(documentState.bitmap);
  renderHints(hints);
}
function onButtonValidate(event) {
  const hints = generateHints(documentState.bitmap);

  const result = solve(hints);

  //showMessage(`Кількість розв'язків: ${solutionCount}`);
  showSolutions(result.solutions);
}

/**
 *
 * Відображає модальне повідомлення.
 *
 * @param {string} message Текст повідомлення.
 */
function showMessage(message) {
  editorMessageText.textContent = message;
  editorMessage.classList.remove("editor__message--hidden");
}

/**
 * Приховує вікно повідомлення.
 */
function hideMessage(event) {
  editorMessage.classList.add("editor__message--hidden");
}

function updateExportButton() {
  const hints = generateHints(documentState.bitmap);
  const result = solve(hints);
  solutionCount = result.solutionCount;
  editorButtonExport.disabled = documentState.isModified || solutionCount !== 1;
}

async function getNextDataSetNumber(contentDirHandle) {
  let maxNumber = 0;

  for await (const [name, handle] of contentDirHandle.entries()) {
    if (handle.kind !== "directory") {
      continue;
    }

    const match = name.match(/^data-(\d+)$/);

    if (!match) {
      continue;
    }

    const number = Number(match[1]);

    if (number > maxNumber) {
      maxNumber = number;
    }
  }

  return maxNumber + 1;
}

async function getContentDirHandle() {
  let projectDirHandle = await loadProjectHandle();

  if (!projectDirHandle) {
    projectDirHandle = await window.showDirectoryPicker();

    await saveProjectHandle(projectDirHandle);
  }

  const permission = await projectDirHandle.queryPermission({
    mode: "readwrite",
  });

  if (permission !== "granted") {
    const requestedPermission = await projectDirHandle.requestPermission({
      mode: "readwrite",
    });

    if (requestedPermission !== "granted") {
      throw new Error("Немає дозволу на запис у папку проєкту.");
    }
  }

  const contentDirHandle = await projectDirHandle.getDirectoryHandle("content");

  return contentDirHandle;
}

async function createDataSetDirectory() {
  const contentDirHandle = await getContentDirHandle();

  const nextNumber = await getNextDataSetNumber(contentDirHandle);

  const folderName = `data-${String(nextNumber).padStart(3, "0")}`;

  const dataSetDirHandle = await contentDirHandle.getDirectoryHandle(
    folderName,
    {
      create: true,
    },
  );

  return dataSetDirHandle;
}

function createDataFileContent() {
  return `export default {

    meta: {
        sourceFile: "${documentState.documentName}"
    },

    title: "${documentState.title}",

    width: ${documentState.width},
    height: ${documentState.height},

    bitmap: ${JSON.stringify(documentState.bitmap, null, 4)}

};
`;
}
async function writeDataFile(dataSetDirHandle) {
  const fileHandle = await dataSetDirHandle.getFileHandle("data.js", {
    create: true,
  });

  const writable = await fileHandle.createWritable();

  const content = createDataFileContent();

  await writable.write(content);
  await writable.close();
}

async function exportDocument() {
  try {
    const dataSetDirHandle = await createDataSetDirectory();

    await writeDataFile(dataSetDirHandle);
  } catch (error) {
    console.error("Помилка експорту:", error);
  }
}
