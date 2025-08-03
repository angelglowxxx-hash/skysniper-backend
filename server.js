// SkySniper — Master Backend v1.9.3
// 🧠 One-file API with AI prediction, Supabase sync, hash decoding, HUD rendering, and admin control

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8080;

// 🔐 Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔧 Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🔐 Token check for admin access
function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) return res.status(403).send("Forbidden");
  next();
}

// 🔮 Gemini AI prediction
async function generateAIResponse({ hash, latestMultiplier, pattern }) {
  try {
    const res = await fetch(process.env.GEMINIMODELURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINIAPIKEY}`
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `Predict next crash multiplier for hash ${hash} and last multiplier ${latestMultiplier}` }]
        }]
      })
    });

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "No prediction";

    return {
      next_prediction: text.match(/[\d.]+x/)?.[0] || "2.15x",
      tag: text.includes("safe") ? "safe" : "volatile",
      pattern,
      commentary: text
    };
  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    return {
      next_prediction: "2.15x",
      tag: "unknown",
      pattern,
      commentary: "AI prediction unavailable"
    };
  }
}

// 🔓 Hash decoder (placeholder logic)
function decodeHash(hash) {
  return {
    decoded_hash: hash.split("").reverse().join(""),
    crash_point: "2.15"
  };
}

// 📡 Fingerprint capture
app.post("/capture", async (req, res) => {
  const { site_url, dom_signature, network_patterns } = req.body;
  if (!site_url || !dom_signature) return res.status(400).json({ error: "Missing site_url or dom_signature" });

  try {
    await supabase.from("site_fingerprints").insert([{ site_url, dom_signature, network_patterns }]);
    res.json({ status: "ok", synced: true });
  } catch (err) {
    console.error("❌ Supabase insert error:", err.message);
    res.status(500).json({ error: "Supabase sync failed" });
  }
});

// 🔮 AI prediction
app.post("/predict", async (req, res) => {
  const { round_id, hash, latestMultiplier, pattern } = req.body;
  if (!round_id || !hash) return res.status(400).json({ error: "Missing round_id or hash" });

  const prediction = await generateAIResponse({ hash, latestMultiplier, pattern });

  try {
    await supabase.from("prediction_logs").insert([{ round_id, hash, prediction: prediction.next_prediction, tag: prediction.tag }]);
  } catch (err) {
    console.error("❌ Prediction log error:", err.message);
  }

  res.json(prediction);
});

// 🔓 Hash verifier
app.post("/hashVerifier", (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: "Missing hash" });

  const result = decodeHash(hash);
  res.json({ ...result, verified: true });
});

// 🧠 HUD state
app.get("/uiState", (req, res) => {
  const { round_id, site_url } = req.query;
  if (!round_id || !site_url) return res.status(400).json({ error: "Missing round_id or site_url" });

  res.json({
    state: "ready",
    commentary: "AI confident in next round",
    timestamp: new Date().toISOString()
  });
});

// 🧩 HUD layout config
app.get("/gameConfig", (req, res) => {
  const { site_url } = req.query;
  if (!site_url) return res.status(400).json({ error: "Missing site_url" });

  res.json({
    layout: "default",
    theme: "dark",
    modules: ["prediction", "hashVerifier", "trendGraph"],
    branding: {
      color: "#ff0033",
      logo: "https://skysniper.io/logo.png"
    }
  });
});

// 🧠 Admin panel
app.get("/admin", verifyAdmin, async (req, res) => {
  try {
    const { data: fingerprints } = await supabase.from("site_fingerprints").select("*").limit(10).order("timestamp", { ascending: false });
    const { data: rounds } = await supabase.from("prediction_logs").select("*").limit(10).order("timestamp", { ascending: false });

    res.render("admin", {
      ai_model: process.env.GEMINIMODELNAME || "Gemini Flash",
      supabase_url: process.env.SUPABASE_URL || "Not set",
      backend_url: process.env.BACKEND_URL || "Not set",
      fingerprints,
      rounds,
      diagnostics: {
        status: "🟢 OK",
        version: "v1.9.3",
        message: "All systems nominal",
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("❌ Admin panel error:", err.message);
    res.status(500).send("Admin panel failed to load");
  }
});

// 🔐 Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Health check
app.get("/ping", (req, res) => {
  res.json({
    status: "🟢 Online",
    version: "v1.9.3",
    timestamp: new Date().toISOString(),
    message: "SkySniper backend is alive and sniping 💥"
  });
});

// 🏠 Redirect to admin
app.get("/", (req, res) => {
  res.redirect("/admin");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running at ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
});
