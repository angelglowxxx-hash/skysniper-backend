// coreUtils.js 🧠 SkySniper Logic Core
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

// ☁️ Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)

// 🔮 Gemini AI Prediction
export async function generateAIResponse({ hash, latestMultiplier, pattern }) {
  const prompt = `
    Crash Game Round:
    - Hash: ${hash}
    - Last Multiplier: ${latestMultiplier}
    - Pattern: ${pattern.join(', ')}

    Predict next crash multiplier and tag it as 'safe' or 'volatile'.
    Respond in JSON: { next_prediction, tag, commentary, pattern_analysis }
  `
  try {
    const res = await fetch(`${process.env.GEMINI_MODEL_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    })
    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return JSON.parse(text)
  } catch (err) {
    console.error('❌ Gemini AI error:', err.message)
    return {
      next_prediction: '1.00x',
      tag: 'unknown',
      commentary: 'AI prediction unavailable',
      pattern_analysis: []
    }
  }
}

// 🔓 Hash Decoder (placeholder logic)
export function decodeHash(hash) {
  if (!hash) return { decoded_hash: '', crash_point: '1.00' }
  const reversed = hash.split('').reverse().join('')
  return {
    decoded_hash: reversed,
    crash_point: '2.15' // Replace with real decode logic if needed
  }
}

// 📡 Fingerprint Capture
export async function captureFingerprint({ site_url, dom_signature, network_patterns }) {
  await supabase.from('site_fingerprints').insert([{ site_url, dom_signature, network_patterns }])
}

// 🔮 Prediction Logging
export async function logPrediction({ round_id, hash, next_prediction, tag }) {
  await supabase.from('prediction_logs').insert([{ round_id, hash, next_prediction, tag }])
}

// 📊 Get Fingerprints
export async function getFingerprints(limit = 10) {
  const { data } = await supabase
    .from('site_fingerprints')
    .select('*')
    .order('inserted_at', { ascending: false })
    .limit(limit)
  return data || []
}

// 📈 Get Latest Rounds
export async function getLatestRounds(limit = 10) {
  const { data } = await supabase
    .from('prediction_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  return data || []
}

// 🧠 Diagnostics
export function getDiagnostics() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.9.3'
  }
}

// 🧩 AI-Generated HUD Config
export async function generateConfig({ site_url, game }) {
  const prompt = `
    Generate a HUD layout config for crash game "${game}" on "${site_url}".
    Respond in JSON: { layout, theme, modules[], branding: { color, logo } }
  `
  try {
    const res = await fetch(`${process.env.GEMINI_MODEL_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    })
    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return JSON.parse(text)
  } catch (err) {
    console.error('❌ Config AI error:', err.message)
    return {
      layout: 'default',
      theme: 'dark',
      modules: ['prediction', 'hashVerifier', 'trendGraph'],
      branding: {
        color: '#ff0033',
        logo: 'https://skysniper.io/logo.png'
      }
    }
  }
}
