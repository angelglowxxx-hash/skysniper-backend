// server.js 🚀 SkySniper Master Backend v1.9.3
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const app        = express()
const PORT       = process.env.PORT || 8080

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Utility: call Gemini with a free‐form prompt
async function callGemini(prompt) {
  const res = await fetch(`${process.env.GEMINI_MODEL_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents:[{ role:'user', parts:[{ text: prompt }] }] })
  })
  const json = await res.json()
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// AI Assistant endpoint
app.post('/admin/ai-fix', async (req, res) => {
  if (req.headers['x-admin-token'] !== process.env.ADMIN_TOKEN && req.cookies.admin_token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send('Forbidden')
  }
  const { instruction } = req.body
  if (!instruction) return res.status(400).send('Missing instruction')
  try {
    // Build a prompt to ask Gemini to update config or suggest code
    const prompt = `
      You are SkySniper's AI assistant.
      Instruction: ${instruction}
      Return only valid JSON with keys:
        - "action": one of ["update_config","suggest_code","other"]
        - "payload": object or text describing the change.
    `
    const reply = await callGemini(prompt)
    // Optionally parse JSON or store payload in Supabase
    let parsed
    try { parsed = JSON.parse(reply) }
    catch { parsed = { action:'other', payload:reply } }
    // If update_config, push to Supabase
    if (parsed.action === 'update_config' && parsed.payload?.site_url) {
      await supabase.from('game_configs')
        .insert([{ site_url: parsed.payload.site_url, game: parsed.payload.game, config: parsed.payload.config }])
    }
    res.json({ status:'ok', result: parsed })
  } catch (err) {
    console.error('❌ AI-Fix error:', err)
    res.status(500).json({ error:'AI assistant failed', details: err.message })
  }
})

// --- include your existing /capture, /predict, /hashVerifier, /uiState, /gameConfig, /login, /admin, /admin/pushConfig ... ---
// For brevity, they mount from routes.js:
import router from './routes.js'
app.use('/', router)

// Inline admin HTML with AI Assistant dialogue
const adminHTML = {
  panel: ({ fps, rds, diagnostics }) => `
    <!DOCTYPE html>
    <html lang="en"><head><meta charset="UTF-8"><title>SkySniper Admin</title>
    <style>
      body { background:#0f0f0f; color:#fff; font-family:'Segoe UI',sans-serif; padding:2rem }
      h1,h2 { color:#ff0055 }
      section { margin-bottom:2rem; border-bottom:1px solid #333; padding-bottom:1rem }
      ul, li { list-style:none; padding:0; margin:0 0 1rem 0 }
      input, textarea, button { display:block; width:100%; margin-top:.5rem; padding:.5rem; border-radius:4px }
      textarea { height:80px; background:#111; color:#fff; border:1px solid #444 }
      input { background:#222; color:#fff; border:1px solid #444 }
      button { background:#ff0055; color:#fff; border:none; cursor:pointer }
      .flash { background:#055; padding:.5rem 1rem; border-radius:4px; margin-bottom:1rem }
    </style></head><body>
      <h1>🧠 SkySniper Admin Panel</h1>
      <p><small>${diagnostics.timestamp}</small></p>
      
      <section>
        <h2>🔧 System Info</h2>
        <p><strong>AI Model:</strong> ${process.env.GEMINI_MODEL_NAME}</p>
        <p><strong>Supabase:</strong> ${process.env.SUPABASE_URL}</p>
        <p><strong>Version:</strong> ${diagnostics.version}</p>
      </section>
      
      <section>
        <h2>🔍 Fingerprints</h2>
        ${fps.length 
          ? `<ul>${fps.map(fp=>`<li>${fp.site_url} — modules: ${(fp.modules||[]).join(', ')}</li>`).join('')}</ul>` 
          : `<p>No fingerprints yet.</p>`}
      </section>
      
      <section>
        <h2>🎯 Latest Predictions</h2>
        ${rds.length 
          ? `<ul>${rds.map(r=>`<li>Round ${r.round_id}: ${r.next_prediction} (${r.tag})</li>`).join('')}</ul>`
          : `<p>No predictions yet.</p>`}
      </section>
      
      <section>
        <h2>🤖 AI Assistant</h2>
        <form id="aiFixForm">
          <textarea name="instruction" placeholder="E.g. ‘Enable trendGraph by default for site X’"></textarea>
          <button type="submit">Send to AI</button>
        </form>
        <pre id="aiFixResult" style="background:#111; padding:1rem; border-radius:4px; margin-top:1rem;"></pre>
      </section>
      
      <section>
        <h2>🧩 Push Config via AI</h2>
        <form method="POST" action="/admin/pushConfig">
          <input name="site_url"   placeholder="Site URL" required />
          <input name="game"       placeholder="Game Name" required />
          <button>Push Config</button>
        </form>
      </section>
      
      <section>
        <h2>🧪 Diagnostics</h2>
        <pre>${JSON.stringify(diagnostics, null, 2)}</pre>
      </section>

      <script>
        // Hook AI Assistant form
        document.getElementById('aiFixForm').onsubmit = async e => {
          e.preventDefault()
          const form = e.target
          const resBox = document.getElementById('aiFixResult')
          resBox.textContent = '🕒 Waiting for AI...'
          const resp = await fetch('/admin/ai-fix', {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ instruction: form.instruction.value })
          })
          const json = await resp.json()
          resBox.textContent = JSON.stringify(json, null, 2)
        }
      </script>
    </body></html>
  `
}

// Mount updated adminHTML in routes.js or inline after router
// (if using inline routes, replace /admin handler with adminHTML.panel)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkySniper backend running at ${process.env.BACKEND_URL}`)
})
