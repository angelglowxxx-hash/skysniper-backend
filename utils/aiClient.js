// SkySniper — utils/aiClient.js
// 🔮 Gemini 2.5 Flash AI prediction + config wrapper

import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_URL = process.env.GEMINI_MODEL_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Predict next multiplier, tag safety, decode hash, analyze pattern
 */
export async function getPrediction({ latestMultiplier, pattern = [], hash = "" }) {
  if (!latestMultiplier || !Array.isArray(pattern)) {
    return { error: "Invalid input", timestamp: new Date().toISOString() };
  }

  const prompt = `
Crash Game Round:
- Last Multiplier: ${latestMultiplier}x
- Pattern: ${pattern.join(", ")}
- Hash: ${hash}

Analyze the round. Return:
- decoded hash
- next_prediction
- safety tag
- pattern analysis
`;

  try {
    const response = await fetch(`${GEMINI_MODEL_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      decoded: output.match(/decoded.*?:\s*(.*)/i)?.[1] || "N/A",
      next_prediction: output.match(/next_prediction.*?:\s*(.*)/i)?.[1] || "N/A",
      tag: output.match(/tag.*?:\s*(.*)/i)?.[1] || "N/A",
      pattern: output.match(/pattern.*?:\s*(.*)/i)?.[1] || "N/A",
      raw: output,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("❌ getPrediction error:", err.message);
    return {
      error: "AI prediction failed",
      details: err.message,
      timestamp: new Date().toISOString()
    };
  }
}
