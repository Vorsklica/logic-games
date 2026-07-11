require('dotenv').config();

const { TelegramBot } = require('node-telegram-bot-api');



const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token);

bot.sendMessage(
    chatId,
    '🧩 Нова гра Logic Games!',
    {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🎮 Грати',
                        url: 'https://vorsklica.github.io/logic-games/'
                    }
                ]
            ]
        }
    }
)
.then(() => {
    console.log('Повідомлення успішно надіслано.');
})
.catch(console.error);