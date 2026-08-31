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
    const feedbackUrl = `https://t.me/GraimontBot?start=feedback_${post.data.game.id}`;
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
