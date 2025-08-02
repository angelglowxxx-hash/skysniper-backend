// SkySniper — routes/admin.js
// 🧠 Admin panel route with fingerprint viewer, config pusher, diagnostics

import express from 'express';
import { getFingerprints, getLatestRounds, updateConfig } from '../utils/dbClient.js';
import { suggestModules } from '../utils/aiClient.js';
import { getDiagnostics } from '../utils/diagnostics.js';

const router = express.Router();

// 🔓 Public access — token check disabled
router.use((req, res, next) => next());

// 🧩 Admin dashboard view
router.get("/", async (req, res) => {
  try {
    const fingerprints = await getFingerprints() || [];
    const rounds = await getLatestRounds() || [];
    const diagnostics = await getDiagnostics();

    res.render("admin", {
      ai_model: process.env.GEMINI_MODEL_NAME || "Gemini Flash",
      backend_url: process.env.BACKEND_URL || "Not set",
      supabase_url: process.env.SUPABASE_URL || "Not set",
      fingerprints,
      rounds,
      diagnostics
    });
  } catch (err) {
    console.error("❌ Admin panel error:", err.message);
    res.status(500).send("Admin panel failed to load");
  }
});

// 🔮 Push AI-generated config for a site/game
router.post("/pushConfig", async (req, res) => {
  const { site_url, game } = req.body;
  if (!site_url || !game) {
    return res.status(400).json({ error: "Missing site_url or game" });
  }

  try {
    const config = await suggestModules({ site_url, game });
    await updateConfig(site_url, config);
    res.json({ status: "pushed", config });
  } catch (err) {
    console.error("❌ Config push error:", err.message);
    res.status(500).json({ error: "Push failed", details: err.message });
  }
});

// 🧪 Diagnostics JSON endpoint
router.get("/diagnostics", async (req, res) => {
  try {
    const diagnostics = await getDiagnostics();
    res.json(diagnostics);
  } catch (err) {
    console.error("❌ Diagnostics error:", err.message);
    res.status(500).json({ error: "Diagnostics failed", details: err.message });
  }
});

export default router;
