// SkySniper — server.js v1.2
// 🧠 Modular backend API for AI prediction, hash decode, fingerprint memory, Supabase sync

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🔗 Route Imports
import decodeRoute from './routes/decode.js';
import predictRoute from './routes/predict.js';
import syncRoundRoute from './routes/syncRound.js';
import statusRoute from './routes/status.js';
import captureRoute from './routes/capture.js';
import gameConfigRoute from './routes/gameConfig.js';

// 🧩 Mount Routes
app.use("/decode", decodeRoute);
app.use("/predict", predictRoute);
app.use("/syncRound", syncRoundRoute);
app.use("/status", statusRoute);
app.use("/capture", captureRoute);
app.use("/gameConfig", gameConfigRoute);

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
