// SkySniper — server.js v1.1
// 🧠 Modular backend API for AI prediction, hash decode, Supabase sync

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

// 🧩 Mount Routes
app.use("/decode", decodeRoute);
app.use("/predict", predictRoute);
app.use("/syncRound", syncRoundRoute);
app.use("/status", statusRoute);

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running at http://localhost:${PORT}`);
});
