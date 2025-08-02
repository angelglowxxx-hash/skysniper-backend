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

// In-memory logs/errors for dashboard (replace with DB for production)
let apiLogs = [];
let apiErrors = [];

// Middleware to log requests/errors
app.use((req, res, next) => {
  if (!req.url.startsWith("/dashboard-assets")) {
    apiLogs.push({
      method: req.method,
      url: req.url,
      time: new Date().toISOString(),
      ip: req.ip
    });
    if (apiLogs.length > 200) apiLogs.shift();
    io.emit("api_log", apiLogs[apiLogs.length - 1]);
  }
  next();
});

// Health/info endpoints
app.get('/', (req, res) => {
  res.send('<span style="color:green;font-size:2em;">🟢 SkySniper Backend API is Running!</span>');
});
app.get('/status', statusCheck);

// API endpoints
app.get('/decode', (req, res) => {
  res.status(405).send('This endpoint only supports POST requests for decoding.');
});
app.post('/decode', decode);
app.post('/syncRound', syncRound);

// Dashboard routes (static assets)
app.get('/dashboard', (req, res) => {
  res.sendFile(process.cwd() + '/dashboard.html');
});
app.get('/dashboard-assets/:file', (req, res) => {
  res.sendFile(process.cwd() + '/dashboard-assets/' + req.params.file);
});

// Dashboard API for fetching logs/status/errors/env
app.get('/dashboard-api/logs', (req, res) => {
  res.json({ logs: apiLogs.slice(-200) });
});
app.get('/dashboard-api/errors', (req, res) => {
  res.json({ errors: apiErrors.slice(-50) });
});
app.get('/dashboard-api/status', (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      AI_MODEL_NAME: process.env.AI_MODEL_NAME,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SYNC_ENDPOINT: process.env.SYNC_ENDPOINT
    }
  });
});

// 404 and error handler
app.use((req, res) => {
  res.status(404).send('❌ Endpoint not found. See /status for API health.');
});
app.use((err, req, res, next) => {
  console.error('❗ Server Error:', err);
  apiErrors.push({
    message: err.message,
    stack: err.stack,
    url: req.url,
    time: new Date().toISOString()
  });
  if (apiErrors.length > 50) apiErrors.shift();
  io.emit("api_error", apiErrors[apiErrors.length - 1]);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running on port ${PORT}`);
});
