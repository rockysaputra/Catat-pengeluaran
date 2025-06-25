import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("🤖 Bot is polling and waiting for messages...");


// Ganti URL ini kalau lo pakai ngrok:
const ENDPOINT = 'http://localhost:3000/upload-data';

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  try {
    const res = await axios.post(ENDPOINT, {
      text: userInput
    });

    if (res.status === 200 || res.status === 202) {
      bot.sendMessage(chatId, '✅ Pengeluaran dicatat!');
    } else {
      bot.sendMessage(chatId, '❌ Gagal kirim ke server. Cek endpoint-nya!');
    }
  } catch (error) {
    console.error('Error saat kirim data:', error.message);
    bot.sendMessage(chatId, '🚨 Error saat kirim data ke server!');
  }
});
