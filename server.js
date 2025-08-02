// SkySniper — server.js v1.9
// 🧠 Modular backend API with admin panel, AI prediction, fingerprint memory, Supabase sync

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static assets (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Set up EJS view engine for admin panel
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Use dynamic port for Render, fallback for local
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

// ✅ Add login page route
app.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Public admin panel preview route
app.get("/admin", (req, res) => {
  res.render("admin", {
    ai_model: process.env.GEMINI_MODEL_NAME || "Gemini Flash",
    supabase_url: process.env.SUPABASE_URL || "Not set",
    backend_url: process.env.BACKEND_URL || "Not set",
    fingerprints: [], // can be populated from Supabase later
    rounds: [],       // can be populated from Supabase later
    diagnostics: {
      status: "🟢 Online",
      version: "v1.9",
      timestamp: new Date().toISOString(),
      message: "Welcome Honey Baby 💥 — SkySniper is locked and loaded."
    }
  });
});

// 🌐 Redirect homepage to admin panel
app.get("/", (req, res) => {
  res.redirect("/admin");
});

// 🛡️ Error Handling
process.on("uncaughtException", err => {
  console.error("🔥 Uncaught Exception:", err);
});
process.on("unhandledRejection", err => {
  console.error("🔥 Unhandled Rejection:", err);
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running at http://localhost:${PORT}`);
});
