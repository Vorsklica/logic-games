import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";

const env = dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const CHAT_ID = process.env.CHAT_ID;

const feedbackSessions = new Map();

const FEEDBACK_CHAT_ID = process.env.FEEDBACK_CHAT_ID;

// Обробник /start
bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const parameter = match[1];

  console.log("START:", parameter);

  if (!parameter?.startsWith("feedback_")) {
    return;
  }

  const parts = parameter.split("_");

  const gameId = parts[1];
  const set = parts[2];

  console.log("FEEDBACK SESSION:", {
    chatId: msg.chat.id,
    gameId,
    set,
  });

  feedbackSessions.set(msg.chat.id, {
    gameId,
    set,
  });

  await bot.sendMessage(
    msg.chat.id,
    `📝 Відгук про гру ${gameId}${
      set !== undefined ? ` (сет ${set})` : ""
    }\n\nНапишіть свій відгук або повідомте про помилку.`,
  );
});

// Обробник повідомлень
bot.on("message", async (msg) => {
  console.log("MESSAGE:", msg.text);
  // Нас цікавлять тільки звичайні текстові повідомлення.
  if (!msg.text || msg.text.startsWith("/")) {
    return;
  }

  // Перевіряємо, чи очікуємо від цього користувача відгук.
  const session = feedbackSessions.get(msg.chat.id);

  if (!session) {
    return;
  }

  const { gameId, set } = session;

  const username = msg.from.username
    ? `@${msg.from.username}`
    : msg.from.first_name || "Невідомий користувач";

  const gameInfo = set !== undefined ? `${gameId} (сет ${set})` : gameId;

  const feedbackText = [
    "💬 Новий відгук",
    "",
    `Гра: ${gameInfo}`,
    `Користувач: ${username}`,
    "",
    msg.text,
  ].join("\n");

  // Показуємо відгук у консолі.
  console.log("FEEDBACK:");
  console.log(feedbackText);

  // Надсилаємо відгук власнику бота.
  await bot.sendMessage(FEEDBACK_CHAT_ID, feedbackText);

  // Завершуємо сесію відгуку.
  feedbackSessions.delete(msg.chat.id);

  // Відповідаємо користувачу.
  await bot.sendMessage(msg.chat.id, "✅ Дякуємо за ваш відгук!");
});

/**
 * Формує URL гри.
 */
function buildGameUrl(post) {
  const { id, set } = post.data.game;

  let url = `${process.env.SITE_URL}/games/${id}/`;

  if (set !== undefined) {
    url += `?set=${set}`;
  }
  return url;
}

/**
 * Формує кнопки "🎮 Грати" та "💬 Залишити відгук".
 */
function buildKeyboard(url, feedbackUrl) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎮 Грати",
            url,
          },
        ],
        [
          {
            text: "💬 Залишити відгук",
            url: feedbackUrl,
          },
        ],
      ],
    },
  };
}

/**
 * Публікує пост у Telegram.
 */
export async function publishPost(post) {
  let options = {};

  if (post.data.game) {
    const url = buildGameUrl(post);
    const { id, set } = post.data.game;

    const feedbackParameter =
      set !== undefined ? `feedback_${id}_${set}` : `feedback_${id}`;

    const feedbackUrl = `https://t.me/GraimontBot?start=${feedbackParameter}`;

    options = buildKeyboard(url, feedbackUrl);
  }

  const text = buildPostText(post.data);

  let message;

  if (post.data.image) {
    const imagePath = path.join(path.dirname(post.file), post.data.image);

    if (!fs.existsSync(imagePath)) {
      throw new Error(
        `Image "${post.data.image}" not found.\nPath: ${imagePath}`,
      );
    }

    message = await bot.sendPhoto(CHAT_ID, fs.createReadStream(imagePath), {
      caption: text,
      parse_mode: "HTML",
      has_spoiler: !!post.data.imageSpoiler,
      ...options,
    });
  } else {
    message = await bot.sendMessage(CHAT_ID, text, {
      parse_mode: "HTML",
      ...options,
    });
  }

  return message.message_id;
}

function buildPostText(data) {
  const parts = [];

  if (data.separator) {
    parts.push(`━━━━━━ ${escapeHtml(data.separator)} ━━━━━━`);
  }

  if (data.title) {
    parts.push(
      `<blockquote>${escapeHtml(data.title.toUpperCase())}</blockquote>`,
    );
  }

  if (data.text) {
    const text = escapeHtml(data.text);

    parts.push(data.textSpoiler ? `<tg-spoiler>${text}</tg-spoiler>` : text);
  }

  return parts.join("\n\n");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
