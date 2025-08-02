// SkySniper — routes/capture.js
// 📡 Receives DOM + network data, triggers AI, logs to Supabase

import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/", async (req, res) => {
  const {
    game,
    roundId,
    hash,
    multiplier,
    result,
    type,
    url,
    response: networkResponse,
    timestamp
  } = req.body;

  if (!roundId || !hash || !multiplier) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 🔮 Build AI prompt
    const prompt = `
Crash Game Round:
- Game: ${game}
- Round ID: ${roundId}
- Hash: ${hash}
- Result: ${result || multiplier}x

Is this round fair? Decode the hash. Predict next multiplier. Tag it safe/unsafe. Analyze pattern.
Return:
- decoded hash
- next_prediction
- safety tag
- pattern analysis
`;

    // 🔮 Gemini AI Request
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const aiData = await aiRes.json();
    const output = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "AI response unavailable";

    // 🧠 Parse AI output
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
        game,
        round_id: roundId,
        hash,
        multiplier,
        result,
        decoded,
        next_prediction,
        tag,
        pattern,
        type,
        url,
        network_response: networkResponse,
        timestamp: timestamp || new Date().toISOString()
      })
    });

    const dbResult = await supabaseRes.json();

    // ✅ Return full result
    res.json({
      game,
      roundId,
      hash,
      multiplier,
      result,
      decoded,
      next_prediction,
      tag,
      pattern,
      dbResult,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ Capture error:", err.message);
    res.status(500).json({
      error: "Capture failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
