import express from 'express';
import { decodeHash } from '../utils/hashDecoder.js';
import { getFingerprints, getLatestRounds, logPrediction, logFingerprint } from '../utils/dbClient.js';
import { getDiagnostics } from '../utils/diagnostics.js';
import { generateAIResponse } from '../utils/aiClient.js';

const router = express.Router();

// 🔐 Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// 🧠 Admin panel
router.get("/admin", async (req, res) => {
  try {
    const fingerprints = await getFingerprints();
    const rounds = await getLatestRounds();
    const diagnostics = await getDiagnostics();

    res.render("admin", {
      ai_model: process.env.GEMINI_MODEL_NAME || "Gemini Flash",
      supabase_url: process.env.SUPABASE_URL || "Not set",
      backend_url: process.env.BACKEND_URL || "Not set",
      fingerprints,
      rounds,
      diagnostics
    });
  } catch (err) {
    console.error("❌ Admin panel error:", err.message);
    res.status(500).send("Admin panel failed to load");
  }
});

// ✅ Health check
router.get("/ping", (req, res) => {
  res.json({
    status: "🟢 Online",
    version: "vX.X.X",
    timestamp: new Date().toISOString(),
    message: "SkySniper backend is alive and sniping 💥"
  });
});

// 📡 Fingerprint capture + Supabase sync
router.post("/capture", async (req, res) => {
  const { site_url, dom_signature, network_patterns } = req.body;
  if (!site_url || !dom_signature) {
    return res.status(400).json({ error: "Missing site_url or dom_signature" });
  }

  try {
    await logFingerprint({ site_url, dom_signature, network_patterns });
    console.log("📡 Fingerprint synced:", site_url);
    res.json({ status: "ok", synced: true });
  } catch (err) {
    console.error("❌ Fingerprint sync failed:", err.message);
    res.status(500).json({ error: "Fingerprint sync error" });
  }
});

// 🔮 AI prediction + Supabase log
router.post("/predict", async (req, res) => {
  const { round_id, hash, latestMultiplier, pattern } = req.body;
  if (!round_id || !hash) {
    return res.status(400).json({ error: "Missing round_id or hash" });
  }

  try {
    const aiResponse = await generateAIResponse({ hash, latestMultiplier, pattern });
    await logPrediction({ round_id, hash, prediction: aiResponse.next_prediction, tag: aiResponse.tag });
    console.log("🔮 Prediction logged:", round_id);
    res.json(aiResponse);
  } catch (err) {
    console.error("❌ Prediction failed:", err.message);
    res.status(500).json({ error: "AI prediction error" });
  }
});

// 🧠 HUD state
router.get("/uiState", (req, res) => {
  const { round_id, site_url } = req.query;
  if (!round_id || !site_url) {
    return res.status(400).json({ error: "Missing round_id or site_url" });
  }

  res.json({
    state: "ready",
    commentary: "AI confident in next round",
    timestamp: new Date().toISOString()
  });
});

// 🧩 HUD layout config
router.get("/gameConfig", (req, res) => {
  const { site_url } = req.query;
  if (!site_url) {
    return res.status(400).json({ error: "Missing site_url" });
  }

  res.json({
    layout: "default",
    theme: "dark",
    modules: ["prediction", "hashVerifier", "trendGraph", "siteClassifier"],
    branding: {
      color: "#ff0033",
      logo: "https://skysniper.io/logo.png"
    }
  });
});

// 🔓 Hash verifier
router.post("/hashVerifier", (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: "Missing hash" });

  try {
    const result = decodeHash(hash);
    res.json({
      hash,
      decoded: result.decoded_hash,
      crash_point: result.crash_point,
      verified: true
    });
  } catch (err) {
    console.error("❌ Hash decode failed:", err.message);
    res.status(500).json({ error: "Hash decode error" });
  }
});

// 🧪 Demo route (for testing HUD without live game)
router.get("/demo", (req, res) => {
  res.json({
    round_id: "demo123",
    hash: "abc123xyz",
    prediction: "2.76x",
    commentary: "Volatile round, AI suggests caution",
    modules: ["prediction", "hashVerifier"],
    timestamp: new Date().toISOString()
  });
});

export default router;
