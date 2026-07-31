import config from "./config.js";

const editorTitle = document.getElementById("editor_title");
const editorDocumentSize = document.getElementById("editor_documentSize");
const editorBoard = document.getElementById("editor_board");
const editorButtonClear = document.getElementById("editor_buttonClear");
const editorButtonInvert = document.getElementById("editor_buttonInvert");
const editorButtonNew = document.getElementById("editor_buttonNew");
const editorButtonOpen = document.getElementById("editor_buttonOpen");
const editorButtonSave = document.getElementById("editor_buttonSave");
const editorDocumentName = document.getElementById("editor_documentName");
const editorStatusText = document.getElementById("editor_statusText");
const editorStatusSize = document.getElementById("editor_statusSize");

const documentState = {
  title: config.editorTitle,
  documentName: config.defaultDocumentName,
  width: config.width,
  height: config.height,
  bitmap: [],
  fileHandle: null,
  filePath: null,
};

editorBoard.addEventListener("click", onBoardClick);
editorButtonClear.addEventListener("click", onButtonClearClick);
editorButtonInvert.addEventListener("click", onButtonInvertClick);
editorButtonNew.addEventListener("click", onButtonNewClick);
editorButtonSave.addEventListener("click", onButtonSaveClick);
editorButtonOpen.addEventListener("click", onButtonOpenClick);

initialize();

function onBoardClick(event) {
  const cell = event.target;

  if (!cell.classList.contains("editor__cell")) {
    return;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  toggleCell(row, col);
  updateEditorInfo();
  printBitmap(); // Для тестування
}

function initialize() {
  editorTitle.textContent = `${documentState.title}`;
  editorDocumentSize.textContent = `${documentState.width} × ${documentState.height}`;
  createBitmap();

  createBoard();
  updateEditorInfo();
}

function createBitmap() {
  documentState.bitmap = [];

  for (let row = 0; row < documentState.height; row++) {
    documentState.bitmap.push("0".repeat(documentState.width));
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
  const line = documentState.bitmap[row];

  const value = line[col] === "0" ? "1" : "0";

  documentState.bitmap[row] =
    line.substring(0, col) + value + line.substring(col + 1);

  renderCell(row, col);
  setModified();
}

function renderCell(row, col) {
  const index = row * documentState.width + col;

  const cell = editorBoard.children[index];

  if (documentState.bitmap[row][col] === "1") {
    cell.classList.add("editor__cell--filled");
  } else {
    cell.classList.remove("editor__cell--filled");
  }
}

function onButtonClearClick(event) {
  if (config.confirmClear) {
    if (!confirm("Очистити поле?")) {
      return;
    }
  }

  clearBitmap();
  updateEditorInfo();
  renderBoard();
}

function clearBitmap() {
  createBitmap();
  setModified();
}

function invertBitmap() {
  for (let row = 0; row < documentState.height; row++) {
    let line = "";

    for (let col = 0; col < documentState.width; col++) {
      line += documentState.bitmap[row][col] === "0" ? "1" : "0";
    }

    documentState.bitmap[row] = line;
  }
  setModified();
}

function onButtonInvertClick(event) {
  invertBitmap();
  updateEditorInfo();
  renderBoard();
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
  documentState.height = config.height;
  documentState.width = config.width;
  createBitmap();
  createBoard();
  renderBoard();

  documentState.documentName = config.defaultDocumentName;
  documentState.fileHandle = null;
  documentState.isModified = false;

  updateEditorInfo();
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
  documentState.width = documentData.width;
  documentState.height = documentData.height;

  documentState.bitmap = documentData.bitmap;

  documentState.documentName = fileHandle.name;
  documentState.fileHandle = fileHandle;
  documentState.isModified = false;
}
/*=========================================================*/

function printBitmap() {
  console.clear();

  console.log(documentState.bitmap.join("\n"));
}

function setModified() {
  documentState.isModified = true;
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
