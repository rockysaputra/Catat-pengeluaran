import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

let apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

export async function parsePengeluaran(text) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // atau "gpt-4" kalo mau
    messages: [
      {
        role: "system",
        content: `
        Kamu adalah asisten keuangan. 
        Tugas kamu adalah mengubah kalimat pengeluaran yang diketik user menjadi array JSON valid.

        Output harus:
        - Tanpa teks tambahan, hanya JSON array
        - Field: tanggal (YYYY-MM-DD), deskripsi, kategori, jumlah (number)
        - Semua tanggal default ke "${today}"
        - Gunakan hanya kategori berikut: 
          ["Makanan", "Minuman", "Transportasi", "Belanja", "Kebutuhan Rumah", "Hiburan", "Kesehatan", "Lainnya"]
        - Jika tidak yakin, gunakan "Lainnya"
        - Jika pada angka tertulis "rb" atau "jt", ubah ke angka biasa (500rb jadi 500000, 10jt jadi 10000000)

        Contoh input:
        "kopi janji jiwa 25000, gojek 15000, Popok Bayi 25000, pulsa 10000, wifi 500rb, laptop 10jt"

        Contoh output:
        [
          {
            "tanggal": "${today}",
            "deskripsi": "Kopi Janji Jiwa",
            "kategori": "Minuman",
            "jumlah": 25000
          },
          {
            "tanggal": "${today}",
            "deskripsi": "Gojek",
            "kategori": "Transportasi",
            "jumlah": 15000
          },
          {
            "tanggal": "${today}",
            "deskripsi": "popok bayi",
            "kategori": "Kebutuhan rumah",
            "jumlah": 15000
          },
          {
            "tanggal": "2025-06-25",
            "deskripsi": "Pulsa",
            "kategori": "Lainnya",
            "jumlah": 10000
          },
          {
            "tanggal": "2025-06-25",
            "deskripsi": "Wifi",
            "kategori": "Lainnya",
            "jumlah": 500000
          },
          {
            "tanggal": "2025-06-25",
            "deskripsi": "Laptop",
            "kategori": "Lainnya",
            "jumlah": 10000000
          }

        ]
        `.trim()
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0,
  });

  const output = res.choices[0].message.content;
  return output;
}