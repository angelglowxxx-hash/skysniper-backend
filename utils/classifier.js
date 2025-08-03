// SkySniper — utils/classifier.js
// 🧠 Classify site fingerprint using Gemini AI and return type + modules

import fetch from 'node-fetch';

export async function classifySite({ site_url, dom_signature, network_patterns = [] }) {
  const prompt = `
You're an expert in online gaming platforms. Analyze the following site fingerprint and classify it.

Site URL: ${site_url}
DOM Signature: ${dom_signature.slice(0, 500)}...
Network Patterns: ${network_patterns.join(', ')}

Classify the site as one of: "casino", "crash_game", "other".
Also suggest relevant modules for a prediction dashboard (e.g. predictor, hashVerifier, trendGraph).
Respond in JSON format:
{
  "type": "...",
  "confidence": "...",
  "modules": [...]
}
`;

  try {
    const response = await fetch(process.env.GEMINI_MODEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Try to parse AI response
    const parsed = JSON.parse(rawText);
    return {
      type: parsed.type || 'other',
      confidence: parsed.confidence || 'low',
      modules: parsed.modules || []
    };
  } catch (err) {
    console.error('❌ classifySite error:', err.message);
    return {
      type: 'unknown',
      confidence: 'low',
      modules: []
    };
  }
}
