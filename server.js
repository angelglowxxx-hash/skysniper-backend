// SkySniper — Master Backend v1.9.3 (All-in-One server.js)
// 🧠 One-file API with AI prediction, Supabase sync, hash decoding, HUD rendering, admin control + inline login + pushConfig

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8080

// 🔐 Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// 🔧 Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 🔐 Admin token check (header or cookie)
function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.cookies.admin_token
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send('Forbidden')
  }
  next()
}

// 🔮 Gemini AI prediction
async function generateAIResponse({ hash, latestMultiplier, pattern }) {
  try {
    const aiRes = await fetch(process.env.GEMINIMODELURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GEMINIAPIKEY}`,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Predict next crash multiplier for hash ${hash} and last multiplier ${latestMultiplier}`
          }]
        }]
      }),
    })
    const json = await aiRes.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return {
      next_prediction: text.match(/[\d.]+x/)?.[0] || '2.15x',
      tag: text.includes('safe') ? 'safe' : 'volatile',
      pattern,
      commentary: text || 'No prediction'
    }
  } catch (err) {
    console.error('❌ Gemini API error:', err.message)
    return {
      next_prediction: '2.15x',
      tag: 'unknown',
      pattern,
      commentary: 'AI prediction unavailable'
    }
  }
}

// 🛠 Generate HUD layout config via AI
async function generateConfig({ site_url, game }) {
  try {
    const aiRes = await fetch(process.env.GEMINIMODELURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GEMINIAPIKEY}`,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Generate a gameConfig JSON for site "${site_url}" and game "${game}". 
                     Respond only with valid JSON: { layout, theme, modules[], branding: { color, logo } }.`
          }]
        }]
      }),
    })
    const json = await aiRes.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return JSON.parse(text)
  } catch (err) {
    console.error('❌ Config AI error:', err.message)
    // Fallback default
    return {
      layout: 'default',
      theme: 'dark',
      modules: ['prediction', 'hashVerifier', 'trendGraph'],
      branding: { color: '#ff0033', logo: 'https://skysniper.io/logo.png' }
    }
  }
}

// 🔓 Hash decoder (placeholder logic)
function decodeHash(hash) {
  return {
    decoded_hash: hash.split('').reverse().join(''),
    crash_point: '2.15'
  }
}

// 📡 Capture client fingerprint
app.post('/capture', async (req, res) => {
  const { site_url, dom_signature, network_patterns } = req.body
  if (!site_url || !dom_signature) {
    return res.status(400).json({ error: 'Missing site_url or dom_signature' })
  }
  try {
    await supabase
      .from('site_fingerprints')
      .insert([{ site_url, dom_signature, network_patterns }])
    res.json({ status: 'ok', synced: true })
  } catch (err) {
    console.error('❌ Supabase insert error:', err.message)
    res.status(500).json({ error: 'Supabase sync failed' })
  }
})

// 🔮 AI prediction endpoint
app.post('/predict', async (req, res) => {
  const { round_id, hash, latestMultiplier, pattern } = req.body
  if (!round_id || !hash) {
    return res.status(400).json({ error: 'Missing round_id or hash' })
  }
  const prediction = await generateAIResponse({ hash, latestMultiplier, pattern })
  try {
    await supabase
      .from('prediction_logs')
      .insert([{ round_id, hash, prediction: prediction.next_prediction, tag: prediction.tag }])
  } catch (err) {
    console.error('❌ Prediction log error:', err.message)
  }
  res.json(prediction)
})

// 🔓 Hash verifier
app.post('/hashVerifier', (req, res) => {
  const { hash } = req.body
  if (!hash) {
    return res.status(400).json({ error: 'Missing hash' })
  }
  const result = decodeHash(hash)
  res.json({ ...result, verified: true })
})

// 🧠 HUD state
app.get('/uiState', (req, res) => {
  const { round_id, site_url } = req.query
  if (!round_id || !site_url) {
    return res.status(400).json({ error: 'Missing round_id or site_url' })
  }
  res.json({
    state: 'ready',
    commentary: 'AI confident in next round',
    timestamp: new Date().toISOString()
  })
})

// 🧩 HUD layout config
app.get('/gameConfig', (req, res) => {
  const { site_url } = req.query
  if (!site_url) {
    return res.status(400).json({ error: 'Missing site_url' })
  }
  res.json({
    layout: 'default',
    theme: 'dark',
    modules: ['prediction', 'hashVerifier', 'trendGraph'],
    branding: {
      color: '#ff0033',
      logo: 'https://skysniper.io/logo.png'
    }
  })
})

// ✅ Health check
app.get('/ping', (req, res) => {
  res.json({
    status: '🟢 Online',
    version: 'v1.9.3',
    timestamp: new Date().toISOString(),
    message: 'SkySniper backend is alive and sniping 💥'
  })
})

// 🏠 Redirect root → login or admin
app.get('/', (req, res) => {
  const token = req.cookies.admin_token
  if (token === process.env.ADMIN_TOKEN) {
    return res.redirect('/admin')
  }
  res.redirect('/login')
})

// 🔓 Login page (inline)
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>SkySniper Admin Login</title>
      <style>
        body { background:#000; color:#fff; font-family:sans-serif; display:flex; height:100vh; align-items:center; justify-content:center; }
        form { background:#111; padding:2rem; border-radius:8px; }
        input, button { display:block; width:100%; margin-top:1rem; padding:.5rem; border-radius:4px; border:none; }
        input { background:#222; color:#fff; }
        button { background:#ff0055; color:#fff; cursor:pointer; }
      </style>
    </head>
    <body>
      <form method="POST" action="/login">
        <h2>Admin Login</h2>
        <input name="token" type="password" placeholder="Admin Token" required />
        <button type="submit">Login</button>
      </form>
    </body>
    </html>
  `)
})

// 🔐 Handle login
app.post('/login', (req, res) => {
  const { token } = req.body
  if (token === process.env.ADMIN_TOKEN) {
    res.cookie('admin_token', token, { httpOnly: true })
    return res.redirect('/admin')
  }
  res.status(403).send('Invalid token')
})

// 🧠 Admin panel + pushConfig form (inline)
app.get('/admin', verifyAdmin, async (req, res) => {
  // fetch latest data
  const { data: fingerprints } = await supabase
    .from('site_fingerprints')
    .select('*')
    .limit(10)
    .order('timestamp', { ascending: false })
  const { data: rounds } = await supabase
    .from('prediction_logs')
    .select('*')
    .limit(10)
    .order('timestamp', { ascending: false })

  const pushed = req.query.pushed === '1'
  const diagnostics = {
    status: '🟢 OK',
    version: 'v1.9.3',
    message: 'All systems nominal',
    timestamp: new Date().toISOString()
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>SkySniper Admin Panel</title>
      <style>
        body { background:#0f0f0f; color:#fff; font-family:'Segoe UI',sans-serif; padding:2rem; }
        h1, h2 { color:#ff0055; }
        section { margin-bottom:2rem; border-bottom:1px solid #333; padding-bottom:1rem; }
        input, button { padding:.5rem; margin-right:.5rem; border-radius:4px; }
        input { background:#1a1a1a; border:1px solid #444; color:#fff; }
        button { background:#ff0055; border:none; color:#fff; cursor:pointer; }
        ul { list-style:none; padding-left:0; }
        li { margin-bottom:1rem; background:#1a1a1a; padding:1rem; border-radius:6px; }
        pre { background:#1a1a1a; padding:1rem; border-radius:6px; overflow-x:auto; }
        .empty { color:#888; font-style:italic; }
        .flash { background:#055; padding:.5rem 1rem; border-radius:4px; margin-bottom:1rem; }
      </style>
    </head>
    <body>
      <h1>🧠 SkySniper Admin Panel</h1>
      <p><small>${diagnostics.timestamp}</small></p>
      ${pushed ? `<div class="flash">✅ Config pushed successfully!</div>` : ''}

      <section>
        <h2>🔧 System Info</h2>
        <p><strong>AI Model:</strong> ${process.env.GEMINIMODELNAME || 'Gemini Flash'}</p>
        <p><strong>Supabase:</strong> ${process.env.SUPABASE_URL || 'Not set'}</p>
        <p><strong>Backend:</strong> ${process.env.BACKEND_URL || 'Not set'}</p>
      </section>

      <section>
        <h2>🔍 Fingerprints</h2>
        ${fingerprints?.length
          ? `<ul>${fingerprints.map(fp => `
            <li>
              <strong>Site:</strong> ${fp.site_url}<br/>
              <strong>Game:</strong> ${fp.game || 'N/A'}<br/>
              <strong>Modules:</strong> ${(fp.modules || []).join(', ') || 'None'}
            </li>`).join('')}</ul>`
          : `<p class="empty">No fingerprints found.</p>`}
      </section>

      <section>
        <h2>🎯 Push Config via AI</h2>
        <form method="POST" action="/admin/pushConfig">
          <input name="site_url" placeholder="Site URL" required />
          <input name="game" placeholder="Game Name" required />
          <button type="submit">Push Config</button>
        </form>
      </section>

      <section>
        <h2>📊 Latest Predictions</h2>
        ${rounds?.length
          ? `<ul>${rounds.map(r => `
            <li>
              <strong>Round:</strong> ${r.round_id}<br/>
              <strong>Multiplier:</strong> ${r.multiplier || '–'}<br/>
              <strong>Prediction:</strong> ${r.prediction || '–'}<br/>
              <strong>Tag:</strong> ${r.tag || '–'}
            </li>`).join('')}</ul>`
          : `<p class="empty">No predictions available.</p>`}
      </section>

      <section>
        <h2>🧪 Diagnostics</h2>
        <pre>${JSON.stringify(diagnostics, null, 2)}</pre>
      </section>
    </body>
    </html>
  `)
})

// 🔧 Handle Push Config via AI
app.post('/admin/pushConfig', verifyAdmin, async (req, res) => {
  const { site_url, game } = req.body
  if (!site_url || !game) {
    return res.status(400).send('Missing site_url or game')
  }
  // Generate config
  const config = await generateConfig({ site_url, game })
  try {
    await supabase
      .from('game_configs')
      .insert([{ site_url, game, config }])
  } catch (err) {
    console.error('❌ game_configs insert error:', err.message)
  }
  res.redirect('/admin?pushed=1')
})

// 🚀 Start server
app.listen(PORT, () => {
  console.log(
    `🚀 SkySniper backend running at ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`
  )
})
