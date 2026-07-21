import config from "./config.js";
//import { getSet } from "../common/url.js";
import { getDataFolder } from "../common/url.js";

// --------------------------------------------------
// Змінні
// --------------------------------------------------

let info;
let task;

// --------------------------------------------------
// Елементи сторінки
// --------------------------------------------------

const gameTitle = document.getElementById("game-title");
const question = document.getElementById("question");
const taskImage = document.getElementById("task-image");
const answerInput = document.getElementById("answer-input");
const checkButton = document.getElementById("check-button");
const message = document.getElementById("message");

// --------------------------------------------------
// Ініціалізація
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    await loadData();

    renderTask();

    registerEvents();
  } catch (error) {
    console.error(error);

    message.textContent = "Не вдалося завантажити задачу.";
  }
}

// --------------------------------------------------
// Завантаження даних
// --------------------------------------------------

async function loadData() {
  const folder = getDataFolder();

  info = (await import(`./content/${folder}/info.js`)).default;

  task = (await import(`./content/${folder}/task.js`)).default;
}

// --------------------------------------------------
// Відображення задачі
// --------------------------------------------------

function renderTask() {
  gameTitle.textContent = info.title;

  question.textContent = task.question;

  taskImage.src = `./content/${info.id}/${task.image}`;

  taskImage.alt = info.title;

  answerInput.type = task.type;

  answerInput.value = "";

  message.textContent = "";
}

// --------------------------------------------------
// Реєстрація подій
// --------------------------------------------------

function registerEvents() {
  checkButton.addEventListener("click", checkAnswer);

  answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });
}

// --------------------------------------------------
// Перевірка відповіді
// --------------------------------------------------

function checkAnswer() {
  const answer = normalizeAnswer(answerInput.value);

  const correct = task.answers.some((item) => {
    return normalizeAnswer(item) === answer;
  });

  if (correct) {
    showSuccess();
  } else {
    showError();
  }
}

function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function showSuccess() {
  message.textContent = "Правильно! ✅";
}

function showError() {
  message.textContent = "Неправильно. ❌";
}

answerInput.addEventListener("input", () => {
  message.textContent = "";
});
