import { getSet } from "../common/url.js";
const currentSet = getSet();
const fileName = `./content/data-${String(currentSet).padStart(3, "0")}.js`;
const { info, tasks } = await import(fileName);

// ==============================
// Find Next
// Головний сценарій гри
// ==============================

// Поточне завдання
let currentTask = 0;

// Кількість правильних відповідей
let score = 0;

// Загальна кількість завдань
const totalTasks = tasks.length;

const task = tasks[currentTask];

// ==============================
// Елементи сторінки
// ==============================

// ============== Game Screen ======================================
const gameScreen = document.getElementById("game-screen");
const titleElement = document.getElementById("game-title");
const progressElement = document.getElementById("progress");
const sequenceElement = document.getElementById("sequence");
const answersElement = document.getElementById("answers");
const messageElement = document.getElementById("message");
const nextButton = document.getElementById("next-button");
const instructionElement = document.getElementById("instruction");

// ============== Result Screen ======================================
const resultScreen = document.getElementById("result-screen");
const resultPercent = document.getElementById("result-percent");
const resultScore = document.getElementById("result-score");
const resultEmoji = document.getElementById("result-emoji");

// ==============================
// Перевірити відповідь
// ==============================

function checkAnswer(selectedIndex) {
  const task = tasks[currentTask];

  const answerCells = document.querySelectorAll(".answer-cell");

  // Блокуємо повторний вибір
  answerCells.forEach((cell) => {
    cell.classList.add("disabled");
  });

  // Очищаємо стиль повідомлення
  messageElement.className = "message";

  // Підсвічуємо правильну відповідь
  answerCells[task.correct].classList.add("correct");

  if (selectedIndex === task.correct) {
    score++;

    messageElement.classList.add("success");

    messageElement.textContent = "✅ Правильно";
  } else {
    answerCells[selectedIndex].classList.add("wrong");

    messageElement.classList.add("error");

    messageElement.textContent = "❌ Неправильно";
  }

  // Для останнього завдання змінюємо напис кнопки
  if (currentTask === totalTasks - 1) {
    nextButton.textContent = "Результат";
  } else {
    nextButton.textContent = "Далі";
  }

  nextButton.hidden = false;
}

// ==============================
// Показати поточне завдання
// ==============================

function showTask() {
  gameScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");
  const task = tasks[currentTask];

  // Заголовок гри
  titleElement.textContent = info.title;

  // Прогрес
  progressElement.textContent = `Завдання ${currentTask + 1} з ${totalTasks}`;

  instructionElement.textContent = info.instruction;

  // Очистити поля
  sequenceElement.innerHTML = "";
  answersElement.innerHTML = "";
  messageElement.textContent = "";
  messageElement.className = "message";

  // ------------------------------
  // Послідовність
  // ------------------------------

  for (const item of task.sequence) {
    const cell = document.createElement("div");

    cell.className = "cell sequence-cell";

    cell.textContent = item === null ? "?" : item;

    sequenceElement.appendChild(cell);
  }

  // ------------------------------
  // Варіанти відповідей
  // ------------------------------

  task.options.forEach((option, index) => {
    const cell = document.createElement("div");

    cell.className = "cell answer-cell";

    cell.textContent = option;

    cell.addEventListener("click", () => {
      checkAnswer(index);
    });

    answersElement.appendChild(cell);
  });
}

// ==============================
// Показати результат гри
// ==============================

function showResult() {
  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const percent = Math.round((score * 100) / totalTasks);

  let emoji = "👎";

  if (percent === 100) {
    emoji = "🏆";
  } else if (percent >= 80) {
    emoji = "👍";
  } else if (percent >= 60) {
    emoji = "🙂";
  } else if (percent >= 40) {
    emoji = "😐";
  }

  resultPercent.textContent = `${percent}%`;

  resultScore.textContent = `${score} із ${totalTasks}`;

  resultEmoji.textContent = emoji;

  gameScreen.hidden = true;

  resultScreen.hidden = false;
}

// ==============================
// Наступне завдання
// ==============================

function nextTask() {
  currentTask++;

  if (currentTask < totalTasks) {
    nextButton.hidden = true;

    showTask();
  } else {
    showResult();
  }
}

nextButton.addEventListener("click", nextTask);

// ===============================
// Запуск гри
// ===============================

showTask();
