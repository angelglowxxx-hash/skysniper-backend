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
    const fingerprints = await getFingerprints(); // Supabase: site_fingerprints
    const rounds = await getLatestRounds();       // Supabase: predictions
    const diagnostics = await getDiagnostics();   // Memory, uptime, routes

    res.render("admin", {
      ai_model: "Gemini 2.5 Flash",
      backend_url: process.env.BACKEND_URL,
      supabase_url: process.env.SUPABASE_URL,
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
  if (!site_url || !game) return res.status(400).json({ error: "Missing site_url or game" });

  try {
    const config = await suggestModules({ site_url, game }); // Gemini-powered
    await updateConfig(site_url, config);                    // Supabase override
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
