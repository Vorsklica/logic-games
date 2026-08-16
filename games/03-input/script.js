import config from "./config.js";
import { getDataFolder } from "../common/url.js";

// --------------------------------------------------
// Змінні
// --------------------------------------------------

let task;

const folder = getDataFolder();

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
    task = (await import(`./content/${folder}/task.js`)).default;
    renderTask();
    registerEvents();
  } catch (error) {
    console.error(error);
    message.textContent = "Не вдалося завантажити задачу.";
  }
}

// --------------------------------------------------
// Відображення задачі
// --------------------------------------------------

function renderTask() {
  gameTitle.textContent = task.title;

  question.textContent = task.question;

  //taskImage.src = `./content/${task.imagePath}/${task.image}`;
  taskImage.src = `./content/${folder}/${task.image}`;

  taskImage.alt = task.title;

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
  message.classList.remove("game__message--wrong");
  message.classList.add("game__message--correct");

  message.textContent = "Правильно! ✅";
}

function showError() {
  message.classList.remove("game__message--correct");
  message.classList.add("game__message--wrong");

  message.textContent = "Неправильно. ❌";
}

function clearMessage() {
  message.textContent = "";

  message.classList.remove("game__message--correct", "game__message--wrong");
}

answerInput.addEventListener("input", (clearMessage) => {
  message.textContent = "";
});
