import express from "express";
import dotenv from "dotenv";
import { parsePengeluaran } from "./Aigw.js";
import rateLimit from "express-rate-limit";
import axios from "axios";
import { initBot } from "./bot/bot.js";

dotenv.config();

const app = express();
app.use(express.json());

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 1 menit
  max: 5, // Max 10 request
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});

app.get("/health-check",async(req,res)=>{
    res.status(200).json({
      status:200,
      message: "Server is healthy",
    })
})

app.post("/upload-data", limiter, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    let output = await parsePengeluaran(text);
    let parsedOutput = JSON.parse(output);
    let WEBHOOK_URL = process.env.WEBHOOK_URL;

    for (let index = 0; index < parsedOutput.length; index++) {
      const element = parsedOutput[index];
      console.log(element);
      let responseData = await axios.post(WEBHOOK_URL,element)
      console.log(responseData.data);
    }
    
    res.status(200).json({
        status:200,
        data:parsedOutput,
        message: "Data parsed successfully"
    });
    
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
});

initBot(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server ready on http://localhost:${port}`);
});
