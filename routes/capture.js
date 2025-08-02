// SkySniper — routes/capture.js
// 📡 Receives DOM + network data, triggers AI, logs to Supabase, returns HUD payload

import express from 'express';
import { getPrediction } from '../utils/aiClient.js';
import { syncRound } from '../utils/dbClient.js';
import { storeFingerprint } from '../utils/fingerprintBuilder.js';
import { logDiagnostics } from '../utils/diagnostics.js';

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    site_url,
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
    // 🧠 Fingerprint Memory
    await storeFingerprint({ site_url, game, hash, url });

    // 🔮 AI Prediction
    const { decoded, next_prediction, tag, pattern, ai_confidence } = await getPrediction({
      site_url, game, roundId, hash, multiplier, result
    });

    // ☁️ Supabase Logging
    const dbResult = await syncRound({
      site_url,
      game,
      roundId,
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
    });

    // 🧪 Diagnostics Overlay
    await logDiagnostics({
      route: "capture",
      status: "success",
      roundId,
      multiplier,
      prediction: next_prediction,
      tag
    });

    // ✅ HUD Payload
    res.json({
      site_url,
      game,
      roundId,
      hash,
      multiplier,
      result,
      decoded,
      next_prediction,
      tag,
      pattern,
      fingerprint_id: `fp-${hash.slice(0, 8)}`,
      ai_confidence: ai_confidence || "high",
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
