// SkySniper — routes/predict.js
// 🔮 AI verification + prediction + Supabase logging

import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/", async (req, res) => {
  const { round_id, hash, multiplier } = req.body;

  if (!round_id || !hash || !multiplier) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 🔮 Build AI prompt
    const prompt = `
You are a crash game analyst. Here's a round:
- Round ID: ${round_id}
- Hash: ${hash}
- Result: ${multiplier}x

Is this round fair? Decode the hash. Predict the next multiplier. Tag it as safe or unsafe. Analyze the pattern.
Return:
- decoded hash
- next_prediction
- safety tag
- pattern analysis
`;

    // 🔮 Send to Gemini
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const aiData = await aiRes.json();
    const output = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response unavailable";

    // 🧠 Parse AI output (basic extract)
    const decoded = output.match(/decoded.*?:\s*(.*)/i)?.[1] || "N/A";
    const next_prediction = output.match(/next_prediction.*?:\s*(.*)/i)?.[1] || "N/A";
    const tag = output.match(/tag.*?:\s*(.*)/i)?.[1] || "N/A";
    const pattern = output.match(/pattern.*?:\s*(.*)/i)?.[1] || "N/A";

    // ☁️ Log to Supabase
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/predictions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        round_id,
        hash,
        multiplier,
        decoded,
        next_prediction,
        tag,
        pattern,
        timestamp: new Date().toISOString()
      })
    });

    const dbResult = await supabaseRes.json();

    // ✅ Return to frontend
    res.json({
      round_id,
      hash,
      multiplier,
      decoded,
      next_prediction,
      tag,
      pattern,
      dbResult,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ AI prediction error:", err.message);
    res.status(500).json({
      error: "Prediction failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
