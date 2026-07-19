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

  let message;

  if (post.data.image) {
    const imagePath = path.join(path.dirname(post.file), post.data.image);

    console.log(imagePath);

    message = await bot.sendPhoto(CHAT_ID, fs.createReadStream(imagePath), {
      caption: post.data.text,
      ...options,
    });
  } else {
    message = await bot.sendMessage(CHAT_ID, post.data.text, options);
  }

  return message.message_id;
}
