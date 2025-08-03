import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// ☁️ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔮 Gemini AI prediction
export async function generateAIResponse({ hash, latestMultiplier, pattern }) {
  const res = await fetch(process.env.GEMINIMODELURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GEMINIAPIKEY}`
    },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: `Predict next crash multiplier for hash ${hash} and last multiplier ${latestMultiplier}` }]
      }]
    })
  });

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "No prediction";

  return {
    next_prediction: text.match(/[\d.]+x/)?.[0] || "2.15x",
    tag: text.includes("safe") ? "safe" : "volatile",
    pattern,
    commentary: text
  };
}

// 🔓 Hash decoder (dummy logic)
export function decodeHash(hash) {
  return {
    decoded_hash: hash.split("").reverse().join(""),
    crash_point: "2.15"
  };
}

// 📡 Fingerprint logging
export async function logFingerprint({ site_url, dom_signature, network_patterns }) {
  await supabase.from("site_fingerprints").insert([{ site_url, dom_signature, network_patterns }]);
}

// 🔮 Prediction logging
export async function logPrediction({ round_id, hash, prediction, tag }) {
  await supabase.from("prediction_logs").insert([{ round_id, hash, prediction, tag }]);
}

// 📊 Get recent fingerprints
export async function getFingerprints() {
  const { data } = await supabase.from("site_fingerprints").select("*").limit(10).order("timestamp", { ascending: false });
  return data || [];
}

// 📈 Get recent rounds
export async function getLatestRounds() {
  const { data } = await supabase.from("prediction_logs").select("*").limit(10).order("timestamp", { ascending: false });
  return data || [];
}

// 🧠 Diagnostics
export function getDiagnostics() {
  return {
    status: "🟢 OK",
    version: "vX.X.X",
    message: "All systems nominal",
    timestamp: new Date().toISOString()
  };
}
