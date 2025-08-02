import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import decode from "./api/decode.js";
import statusCheck from "./statusCheck.js";
import syncRound from "./syncRound.js";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import axios from "axios";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Memory log for dashboard (demo)
let apiLogs = [];
let apiErrors = [];
let extensionEvents = [];

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

app.get("/", (req, res) => {
  res.send('<span style="color:green;font-size:2em;">🟢 SkySniper API Running!</span>');
});
app.get("/status", statusCheck);
app.get("/dashboard", (req, res) => res.sendFile(process.cwd() + "/dashboard.html"));
app.get("/dashboard-assets/:file", (req, res) => res.sendFile(process.cwd() + "/dashboard-assets/" + req.params.file));
app.get("/dashboard-api/logs", (req, res) => res.json({ logs: apiLogs.slice(-200) }));
app.get("/dashboard-api/errors", (req, res) => res.json({ errors: apiErrors.slice(-50) }));
app.get("/dashboard-api/extensions", (req, res) => res.json({ events: extensionEvents.slice(-100) }));

// AI error assistant endpoint
app.post("/ai/assist", async (req, res) => {
  try {
    const { error, context } = req.body;
    const prompt = `Error: ${error}\nContext: ${context}\nSuggest solution and explain.`;
    const aiRes = await axios.post(process.env.AI_MODEL_URL, {
      model: process.env.AI_MODEL_NAME,
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` }
    });
    res.json({ suggestion: aiRes.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "AI assist failed", detail: err.message });
  }
});

// Core API
app.post("/decode", decode);
app.post("/syncRound", syncRound);

// Extension/Socket.io connection
io.on("connection", socket => {
  socket.on("extension_event", data => {
    extensionEvents.push({ ...data, time: new Date().toISOString() });
    if (extensionEvents.length > 100) extensionEvents.shift();
    io.emit("dashboard_extension_event", data); // update dashboard in real time
  });
  socket.on("disconnect", () => {});
});

// Error handling
app.use((req, res) => {
  res.status(404).send("❌ Endpoint not found. See /status for API health.");
});
app.use((err, req, res, next) => {
  apiErrors.push({
    message: err.message,
    stack: err.stack,
    url: req.url,
    time: new Date().toISOString()
  });
  if (apiErrors.length > 50) apiErrors.shift();
  io.emit("api_error", apiErrors[apiErrors.length - 1]);
  res.status(500).json({ status: "error", message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running on port ${PORT}`);
});
