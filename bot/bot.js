import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

export function initBot(app){
  console.log("🤖 Bot is polling and waiting for messages...");
  
  const ENDPOINT = process.env.ENDPOINT_URL
  const WEBHOOK_PATH = `/bot${process.env.TELEGRAM_BOT_TOKEN}`;
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });

  const DOMAIN = process.env.WEBHOOK_DOMAIN;
  bot.setWebHook(`${DOMAIN}${WEBHOOK_PATH}`);

  app.post(WEBHOOK_PATH, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  const allowedChatIds = Number(process.env.CHAT_ID)

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text.trim();

    if(!userInput) return;

    if(userInput === "/start"){
      bot.sendMessage(chatId, '👋 Halo! Kirim aja pengeluaran kamu, contoh:\n\n`ayam geprek 25000, gojek 15000`');
      return;
    }

    if (userInput.startsWith('/')) {
      bot.sendMessage(chatId, '❓ Perintah tidak dikenal. Kirim pengeluaran biasa aja bro~');
      return;
    }

    if (chatId != allowedChatIds){
      bot.sendMessage(chatId, '🚫 Kamu tidak diizinkan untuk menggunakan bot ini.');
      return;
    }

    bot.sendMessage(chatId, "📝 Mencatat pengeluaran...");
    console.log("mencatat pengeluran", chatId)
    try {

      const res = await axios.post(ENDPOINT, {
        text: userInput
      });
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      if (res.status === 200 || res.status === 202) {
        let responseData = res.data;
        let data = responseData.data

        let total = 0
        const lines = data.map((item)=>{
          total += item.jumlah
          return `📌 ${item.deskripsi} — Rp${item.jumlah.toLocaleString('id-ID')} (${item.kategori})`
        })

        const reply = [
          '✅ Tercatat!',
          '',
          ...lines,
          '',
          `📅 Tanggal: ${today}`,
          `💰 Total hari ini: Rp${total.toLocaleString('id-ID')}`
        ].join('\n');

        bot.sendMessage(chatId, reply);
      } else {
        bot.sendMessage(chatId, '❌ Gagal mencatat!');
      }
    } catch (error) {
      console.error('Error saat kirim data:', error.message);
      bot.sendMessage(chatId, '🚨 Error saat kirim data ke server!');
    }
  });
}