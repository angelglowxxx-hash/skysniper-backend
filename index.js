// skysniper-backend/index.js
import express from 'express';
import cors from 'cors';
import decode from './api/decode.js';
import statusCheck from './statusCheck.js';
import syncRound from './syncRound.js';

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Decode hash
app.post('/decode', decode);

// 🛡️ Backend health
app.get('/status', statusCheck);

// ☁️ Sync round to Supabase
app.post('/syncRound', syncRound);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running on port ${PORT}`);
});
