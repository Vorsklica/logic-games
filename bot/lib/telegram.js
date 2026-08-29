import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";

const env = dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN);
const CHAT_ID = process.env.CHAT_ID;

/**
 * Формує URL гри.
 */
function buildGameUrl(post) {
  const { id, set } = post.data.game;

  let url = `${process.env.SITE_URL}/games/${id}/`;

  if (set !== undefined) {
    url += `?set=${set}`;
  }
  console.log(url);
  return url;
}

/**
 * Формує кнопку "🎮 Грати".
 */
function buildKeyboard(url) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎮 Грати",
            url,
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
  const url = buildGameUrl(post);
  const options = buildKeyboard(url);

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
    parts.push(escapeHtml(data.text));
  }

  return parts.join("\n\n");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
