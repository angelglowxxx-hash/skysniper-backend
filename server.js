// SkySniper — server.js v1.3
// 🧠 Modular backend API for AI prediction, hash decode, fingerprint memory, Supabase sync

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
