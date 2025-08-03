// SkySniper — server.js v1.9.2
// 🧠 Modular backend API with admin panel, AI prediction, fingerprint memory, Supabase sync

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase/client.js';
import { getFingerprints, getLatestRounds } from './utils/dbClient.js';
import { getDiagnostics } from './utils/diagnostics.js';

// 🔧 Load environment variables
dotenv.config();

// 📍 Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// 🖼️ Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// 🧩 Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🌐 Use dynamic port for Render
const PORT = process.env.PORT || 8080;

// 🔗 Auto-load all routes from /routes
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(async file => {
  if (file.endsWith('.js')) {
    const routeModule = await import(`./routes/${file}`);
    const routeName = '/' + file.replace('.js', '');
    app.use(routeName, routeModule.default);
    console.log(`🔗 Mounted route: ${routeName}`);
  }
});

// 🔐 Optional login route
app.get("/login", (req, res) => {
  res.render("login");
});

// 🧠 Admin panel route with live data
app.get("/admin", async (req, res) => {
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

// ✅ Ping route for health check
app.get("/ping", (req, res) => {
  res.json({
    status: "🟢 Online",
    version: "v1.9.2",
    timestamp: new Date().toISOString(),
    message: "SkySniper backend is alive and sniping 💥"
  });
});

// 🏠 Redirect homepage to admin
app.get("/", (req, res) => {
  res.redirect("/admin");
});

// 🛡️ Global error handling
process.on("uncaughtException", err => {
  console.error("🔥 Uncaught Exception:", err);
});
process.on("unhandledRejection", err => {
  console.error("🔥 Unhandled Rejection:", err);
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running at http://localhost:${PORT}`);
});
