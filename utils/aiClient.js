// SkySniper — utils/aiClient.js
// 🔮 Gemini 2.5 Flash AI prediction wrapper

import fetch from 'node-fetch';

export async function getPrediction({ latestMultiplier, pattern = [], hash = "" }) {
  if (!latestMultiplier || !Array.isArray(pattern)) {
    return { error: "Invalid input", timestamp: new Date().toISOString() };
  }

  try {
    const prompt = `
You are a crash game analyst. The last round crashed at ${latestMultiplier}x.
Recent pattern: ${pattern.join(", ")}.
Hash: ${hash}.
Predict the next multiplier and tag it as safe or unsafe.
Return only the prediction multiplier and safety tag.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Prediction unavailable";

    return {
      prediction: output,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("❌ AIClient error:", err.message);
    return {
      error: "AI prediction failed",
      details: err.message,
      timestamp: new Date().toISOString()
    };
  }
}
