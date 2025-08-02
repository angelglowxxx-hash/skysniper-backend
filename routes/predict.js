// SkySniper — routes/predict.js
// 🔮 AI prediction using Gemini 2.5 Flash

import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post("/", async (req, res) => {
  const { latestMultiplier, pattern, hash } = req.body;

  if (!latestMultiplier || !Array.isArray(pattern)) {
    return res.status(400).json({ error: "Missing or invalid input" });
  }

  try {
    const prompt = `
You are a crash game analyst. The last round crashed at ${latestMultiplier}x.
Recent pattern: ${pattern.join(", ")}.
Hash: ${hash}.
Predict the next multiplier and tag it as safe or unsafe.
Return only the prediction multiplier and safety tag.
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

    res.json({
      prediction: output,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ AI prediction failed:", err.message);
    res.status(500).json({
      error: "AI prediction failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
