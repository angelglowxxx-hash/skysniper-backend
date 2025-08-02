// SkySniper — routes/gameConfig.js
// 🧠 Returns dynamic UI config based on site/game fingerprint + AI layout generation

import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/", async (req, res) => {
  const { site_url, game } = req.body;

  if (!site_url || !game) {
    return res.status(400).json({ error: "Missing site_url or game" });
  }

  try {
    // ☁️ Fetch fingerprint from Supabase
    const fingerprintRes = await fetch(`${SUPABASE_URL}/rest/v1/site_fingerprints?site_url=eq.${site_url}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    const fingerprint = (await fingerprintRes.json())[0];

    // 🔮 Build AI prompt
    const prompt = `
You are a UI strategist for crash games. Based on the following fingerprint, generate a dashboard config:
- Site: ${site_url}
- Game: ${game}
- DOM Signature: ${JSON.stringify(fingerprint?.dom_signature || {})}
- Network Patterns: ${JSON.stringify(fingerprint?.network_patterns || [])}
- Modules Used: ${JSON.stringify(fingerprint?.modules || [])}

Return a JSON config with:
- game name
- modules (e.g. prediction, hashVerifier, trendGraph)
- theme (bg, fg, accent)
- layout (floating, fixed)
- position (e.g. bottom-right)
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
    const configText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // 🧠 Parse and return config
    const config = JSON.parse(configText);
    res.json(config);

  } catch (err) {
    console.error("❌ gameConfig error:", err.message);
    res.status(500).json({
      error: "Config generation failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
