import express from 'express';
import cors from 'cors';
import decode from './api/decode.js';
import statusCheck from './statusCheck.js';
import syncRound from './syncRound.js';

const app = express();
app.use(cors());
app.use(express.json());

// Root health/info endpoint for browser-friendly response
app.get('/', (req, res) => {
  res.send('🟢 SkySniper Backend API is Running!');
});

// Optional: GET /decode for browser/info (does not perform decoding)
app.get('/decode', (req, res) => {
  res.status(405).send('This endpoint only supports POST requests for decoding.');
});

// 🔐 Decode hash
app.post('/decode', decode);

// 🛡️ Backend health
app.get('/status', statusCheck);

// ☁️ Sync round to Supabase
app.post('/syncRound', syncRound);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).send('❌ Endpoint not found. See /status for API health.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❗ Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running on port ${PORT}`);
});
