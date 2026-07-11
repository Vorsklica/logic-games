require("dotenv").config();

const { TelegramBot } = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

//const bot = new TelegramBot(token);
const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("message", (msg) => {
  console.log("========================");
  console.log("ID чату :", msg.chat.id);
  console.log("Назва   :", msg.chat.title);
  console.log("Тип     :", msg.chat.type);
  console.log("Текст   :", msg.text);
});

bot.on("channel_post", (msg) => {
  console.log("========================");
  console.log("КАНАЛ");
  console.log("ID чату :", msg.chat.id);
  console.log("Назва   :", msg.chat.title);
  console.log("Тип     :", msg.chat.type);
  console.log("Текст   :", msg.text);
});

bot
  .sendMessage(chatId, "🧩 Нова гра Logic Games!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎮 Грати",
            url: "https://vorsklica.github.io/logic-games/games/01-two-colors/",
          },
        ],
      ],
    },
  })
  .then(() => {
    console.log("Повідомлення успішно надіслано.");
  })
  .catch(console.error);
