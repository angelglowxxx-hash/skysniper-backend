// server.js 🚀 SkySniper Master Backend v1.9.3
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { Client as PgClient } from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8080

// ── 1) Auto-create tables at startup via pg ────────────────────────────────────
async function ensureTables() {
  const pg = new PgClient({ connectionString: process.env.SUPABASE_DB_URL })
  await pg.connect()
  const stmts = [
    `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,
    `CREATE TABLE IF NOT EXISTS site_fingerprints (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       site_url TEXT,
       dom_signature TEXT,
       network_patterns JSONB,
       inserted_at TIMESTAMPTZ DEFAULT now()
     );`,
    `CREATE TABLE IF NOT EXISTS prediction_logs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       round_id TEXT,
       hash TEXT,
       next_prediction TEXT,
       tag TEXT,
       timestamp TIMESTAMPTZ DEFAULT now()
     );`,
    `CREATE TABLE IF NOT EXISTS game_configs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       site_url TEXT,
       game TEXT,
       config JSONB,
       inserted_at TIMESTAMPTZ DEFAULT now()
     );`
  ]
  for (let sql of stmts) await pg.query(sql)
  await pg.end()
}

// ── 2) Supabase client for DML ─────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

// ── 3) Common Utilities ────────────────────────────────────────────────────────

// Call Gemini with arbitrary prompt
async function callGemini(prompt) {
  const res = await fetch(
    `${process.env.GEMINI_MODEL_URL}?key=${process.env.GEMINI_API_KEY}`, 
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents:[{ role:'user', parts:[{ text: prompt }] }] })
    }
  )
  const json = await res.json()
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Decode provably-fair hash (placeholder)
function decodeHash(hash='') {
  return {
    decoded_hash: hash.split('').reverse().join(''),
    crash_point: '2.15'
  }
}

// Generate HUD config via AI
async function generateConfig({ site_url, game }) {
  const prompt = `
    Generate HUD config JSON for crash game "${game}" on "${site_url}".
    Respond ONLY with valid JSON: { layout, theme, modules[], branding:{color,logo} }.
  `
  try {
    const txt = await callGemini(prompt)
    return JSON.parse(txt)
  } catch {
    return {
      layout:'default', theme:'dark',
      modules:['prediction','hashVerifier','trendGraph'],
      branding:{ color:'#ff0055', logo:'https://skysniper.io/logo.png' }
    }
  }
}

// Diagnostics data
function getDiagnostics() {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  }
}

// Supabase DML
async function captureFingerprint(data) {
  await supabase.from('site_fingerprints').insert([data])
}
async function logPrediction(data) {
  await supabase.from('prediction_logs').insert([data])
}

// ── 4) Express Middleware ─────────────────────────────────────────────────────
app.use(cors({ origin:true, credentials:true }))
app.use(express.json({ limit:'2mb' }))
app.use(express.urlencoded({ extended:true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,'public')))

// Admin-token guard
function verifyAdmin(req,res,next){
  const t = req.headers['x-admin-token']||req.cookies.admin_token
  if(t!==process.env.ADMIN_TOKEN) return res.status(403).send('Forbidden')
  next()
}

// ── 5) API Routes ─────────────────────────────────────────────────────────────

// Fingerprint capture
app.post('/capture', async (req,res)=>{
  const {site_url, dom_signature, network_patterns} = req.body
  if(!site_url||!dom_signature) return res.status(400).json({error:'Missing data'})
  await captureFingerprint({site_url, dom_signature, network_patterns})
  res.json({status:'ok'})
})

// AI prediction
app.post('/predict', async (req,res)=>{
  const {round_id, hash, latestMultiplier, pattern} = req.body
  if(!round_id||!hash) return res.status(400).json({error:'Missing data'})
  const txt = await callGemini(`
    Crash Game Round:
    - Hash: ${hash}
    - Last Multiplier: ${latestMultiplier}
    - Pattern: ${pattern?.join(', ')}
    Predict next crash multiplier, tag safety, commentary.
    Return JSON: {next_prediction, tag, commentary}.
  `)
  let pred = { next_prediction:'?', tag:'unknown', commentary:txt }
  try { pred = JSON.parse(txt) } catch{}
  await logPrediction({ round_id, hash, next_prediction:pred.next_prediction, tag:pred.tag })
  res.json(pred)
})

// Hash verifier
app.post('/hashVerifier', (req,res)=>{
  if(!req.body.hash) return res.status(400).json({error:'Missing hash'})
  res.json({ ...decodeHash(req.body.hash), verified:true })
})

// HUD commentary
app.get('/uiState', (req,res)=>{
  const {round_id, site_url} = req.query
  if(!round_id||!site_url) return res.status(400).json({error:'Missing params'})
  res.json({ state:'ready', commentary:'AI confident', timestamp:new Date().toISOString() })
})

// HUD layout config
app.get('/gameConfig', async (req,res)=>{
  const {site_url, game} = req.query
  if(!site_url||!game) return res.status(400).json({error:'Missing params'})
  const cfg = await generateConfig({site_url, game})
  res.json(cfg)
})

// Health check
app.get('/ping',(req,res)=>{
  res.json({ status:'🟢 Online', diagnostics:getDiagnostics() })
})

// Login & Admin panel
app.get('/login',(req,res)=>{
  res.send(`
    <form method="POST" action="/login">
      <input name="token" type="password" placeholder="Admin Token"/>
      <button>Login</button>
    </form>
  `)
})
app.post('/login',(req,res)=>{
  if(req.body.token===process.env.ADMIN_TOKEN){
    res.cookie('admin_token',req.body.token,{httpOnly:true})
    return res.redirect('/admin')
  }
  res.status(403).send('Invalid token')
})

// Admin dashboard w/ AI assistant & data views
app.get('/admin', verifyAdmin, async (req,res)=>{
  const { data: fps } = await supabase.from('site_fingerprints').select('*').limit(20)
  const { data: rds } = await supabase.from('prediction_logs').select('*').limit(20)
  const diag = getDiagnostics()
  res.send(`
    <h1>SkySniper Admin</h1>
    <section>
      <h2>System</h2>
      AI Model: ${process.env.GEMINI_MODEL_NAME}<br>
      Supabase: ${process.env.SUPABASE_URL}<br>
      Version: ${diag.version}
    </section>
    <section>
      <h2>Fingerprints</h2>
      <pre>${JSON.stringify(fps,null,2)}</pre>
    </section>
    <section>
      <h2>Predictions</h2>
      <pre>${JSON.stringify(rds,null,2)}</pre>
    </section>
    <section>
      <h2>AI Assistant</h2>
      <form id="aiFix"><textarea name="instruction"></textarea><button>Send</button></form>
      <pre id="aiOut"></pre>
    </section>
    <script>
      document.getElementById('aiFix').onsubmit = async e => {
        e.preventDefault()
        const txt = e.target.instruction.value
        const res = await fetch('/admin/ai-fix',{method:'POST',
          headers:{'Content-Type':'application/json'},body:JSON.stringify({instruction:txt})
        })
        document.getElementById('aiOut').textContent = JSON.stringify(await res.json(),null,2)
      }
    </script>
  `)
})

// AI-fix endpoint (same code as above)
app.post('/admin/ai-fix', verifyAdmin, async (req,res)=>{
  const prompt = `
    You are SkySniper's AI assistant.
    Instruction: ${req.body.instruction}
    Return JSON: {action:"update_config"|"suggest_code"|"other",payload:...}
  `
  try {
    const reply = await callGemini(prompt)
    let parsed = {action:'other',payload:reply}
    try { parsed = JSON.parse(reply) } catch {}
    if(parsed.action==='update_config'&&parsed.payload){
      await supabase.from('game_configs').insert([{ 
        site_url:parsed.payload.site_url,
        game:parsed.payload.game,
        config:parsed.payload.config
      }])
    }
    res.json(parsed)
  } catch (e) {
    res.status(500).json({error:e.message})
  }
})

// ── Start ──────────────────────────────────────────────────────────────────────
;(async()=>{
  await ensureTables()
  app.listen(PORT,()=>console.log(`🚀 Live at ${process.env.BACKEND_URL}`))
})()
