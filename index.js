import express from 'express';
import cors from 'cors';
import decode from './api/decode.js';
import statusCheck from './statusCheck.js';
import syncRound from './syncRound.js';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Store logs in memory for dashboard (for demo; use DB for prod)
let apiLogs = [];

// Middleware to log requests
app.use((req, res, next) => {
  // Only log API, not dashboard assets
  if (!req.url.startsWith("/dashboard-assets")) {
    apiLogs.push({
      method: req.method,
      url: req.url,
      time: new Date().toISOString(),
      ip: req.ip
    });
    if (apiLogs.length > 100) apiLogs.shift();
    io.emit("api_log", apiLogs[apiLogs.length - 1]);
  }
  next();
});

// HEALTH ENDPOINTS
app.get('/', (req, res) => {
  res.send('<span style="color:green;font-size:2em;">🟢 SkySniper Backend API is Running!</span>');
});
app.get('/status', statusCheck);

// API ENDPOINTS
app.get('/decode', (req, res) => {
  res.status(405).send('This endpoint only supports POST requests for decoding.');
});
app.post('/decode', decode);
app.post('/syncRound', syncRound);

// DASHBOARD ROUTE
app.get('/dashboard', (req, res) => {
  res.sendFile(process.cwd() + '/dashboard.html');
});
app.get('/dashboard-assets/:file', (req, res) => {
  res.sendFile(process.cwd() + '/dashboard-assets/' + req.params.file);
});

// API - For dashboard AJAX fetch
app.get('/dashboard-api/logs', (req, res) => {
  res.json({ logs: apiLogs.slice(-100) });
});
app.get('/dashboard-api/status', (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      AI_MODEL_NAME: process.env.AI_MODEL_NAME,
      AI_MODEL_URL: process.env.AI_MODEL_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SYNC_ENDPOINT: process.env.SYNC_ENDPOINT
    }
  });
});

// 404 and error handler as before...
app.use((req, res) => {
  res.status(404).send('❌ Endpoint not found. See /status for API health.');
});
app.use((err, req, res, next) => {
  console.error('❗ Server Error:', err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running on port ${PORT}`);
});
