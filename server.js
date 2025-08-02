// SkySniper — server.js v1.0
// 🧠 Backend API for AI prediction, hash decode, Supabase sync

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🔮 AI Prediction via Gemini 2.5 Flash
app.post("/predict", async (req, res) => {
  const { latestMultiplier, pattern, hash } = req.body;

  try {
    const prompt = `
      You are a crash game analyst. The last round crashed at ${latestMultiplier}x.
      Recent pattern: ${pattern.join(", ")}.
      Hash: ${hash}.
      Predict the next multiplier and tag it as safe or unsafe.
    `;

    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await aiRes.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Prediction unavailable";

    res.json({ prediction: output });
  } catch (err) {
    console.error("❌ AI prediction failed:", err.message);
    res.status(500).json({ error: "AI prediction failed" });
  }
});

// 🔐 Hash Decode (placeholder)
app.post("/decode", async (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: "Missing hash" });

  // TODO: Add real decode logic
  res.json({ decoded: "1.42x (placeholder)" });
});

// ☁️ Supabase Round Sync
app.post("/syncRound", async (req, res) => {
  try {
    const roundData = req.body;

    const syncRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rounds`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(roundData)
    });

    const result = await syncRes.json();
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Supabase sync failed:", err.message);
    res.status(500).json({ error: "Sync failed" });
  }
});

// 🛰️ Health Check
app.get("/status", async (req, res) => {
  res.json({
    online: true,
    syncedRounds: "live",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running on port ${PORT}`);
});
