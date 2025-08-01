// SkySniper — configLoader.js v1.0
// 🧩 Loads config from .env or fallback defaults

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // 🔮 AI Config
  AI_API_KEY: process.env.AI_API_KEY || "demo-ai-key",
  AI_MODEL_URL: process.env.AI_MODEL_URL || "https://openrouter.ai/api/v1/chat/completions",
  AI_MODEL_NAME: process.env.AI_MODEL_NAME || "mistral-7b",

  // ☁️ Supabase Config
  SUPABASE_URL: process.env.SUPABASE_URL || "https://demo.supabase.co",
  SUPABASE_KEY: process.env.SUPABASE_KEY || "demo-supabase-key",
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE || "",

  // 🔗 Backend Endpoints
  SYNC_ENDPOINT: process.env.SYNC_ENDPOINT || "https://localhost:3000/sync",
  PREDICT_ENDPOINT: process.env.PREDICT_ENDPOINT || "https://localhost:3000/predict",
  VERIFY_ENDPOINT: process.env.VERIFY_ENDPOINT || "https://localhost:3000/verify",
  DECODE_ENDPOINT: process.env.DECODE_ENDPOINT || "https://localhost:3000/decode"
};
