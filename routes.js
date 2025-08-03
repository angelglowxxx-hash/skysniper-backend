// routes.js 🔗 SkySniper Route Loader
import express from 'express'
import cookieParser from 'cookie-parser'
import {
  captureFingerprint,
  logPrediction,
  generateAIResponse,
  decodeHash,
  getFingerprints,
  getLatestRounds,
  getDiagnostics,
  generateConfig,
  supabase
} from './coreUtils.js'
import { adminHTML } from './adminView.js'

const router = express.Router()

// 🔐 Middleware
router.use(cookieParser())

function verifyAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.cookies?.admin_token
  if (token !== process.env.ADMIN_TOKEN) return res.status(403).send('Forbidden')
  next()
}

// 📡 /capture → Fingerprint sync
router.post('/capture', async (req, res) => {
  try {
    await captureFingerprint(req.body)
    res.json({ status: 'ok', synced: true })
  } catch (err) {
    console.error('❌ /capture error:', err.message)
    res.status(500).json({ error: 'Fingerprint sync failed' })
  }
})

// 🔮 /predict → AI prediction
router.post('/predict', async (req, res) => {
  const { round_id, hash, latestMultiplier, pattern } = req.body
  if (!round_id || !hash) return res.status(400).json({ error: 'Missing round_id or hash' })

  const prediction = await generateAIResponse({ hash, latestMultiplier, pattern })
  try {
    await logPrediction({ round_id, hash, next_prediction: prediction.next_prediction, tag: prediction.tag })
  } catch (err) {
    console.error('❌ Prediction log error:', err.message)
  }
  res.json(prediction)
})

// 🔓 /hashVerifier → Hash decode
router.post('/hashVerifier', (req, res) => {
  const { hash } = req.body
  if (!hash) return res.status(400).json({ error: 'Missing hash' })
  res.json({ ...decodeHash(hash), verified: true })
})

// 🧠 /uiState → HUD commentary
router.get('/uiState', (req, res) => {
  const { round_id, site_url } = req.query
  if (!round_id || !site_url) return res.status(400).json({ error: 'Missing round_id or site_url' })
  res.json({
    state: 'ready',
    commentary: 'AI confident in next round',
    timestamp: new Date().toISOString()
  })
})

// 🧩 /gameConfig → Layout config (AI-generated)
router.get('/gameConfig', async (req, res) => {
  const { site_url, game } = req.query
  if (!site_url || !game) return res.status(400).json({ error: 'Missing site_url or game' })
  const config = await generateConfig({ site_url, game })
  res.json(config)
})

// ✅ /ping → Health check
router.get('/ping', (req, res) => {
  res.json({
    status: '🟢 Online',
    version: process.env.npm_package_version || '1.9.3',
    diagnostics: getDiagnostics()
  })
})

// 🔐 /login → Token-based login
router.get('/login', (_, res) => res.send(adminHTML.loginForm))

router.post('/login', (req, res) => {
  const { token } = req.body
  if (token === process.env.ADMIN_TOKEN) {
    res.cookie('admin_token', token, { httpOnly: true })
    return res.redirect('/admin')
  }
  res.status(403).send('Invalid token')
})

// 🧠 /admin → Dashboard
router.get('/admin', verifyAdmin, async (req, res) => {
  const fingerprints = await getFingerprints()
  const rounds = await getLatestRounds()
  const diagnostics = getDiagnostics()
  res.send(adminHTML.panel({ fps: fingerprints, rds: rounds, diagnostics }))
})

// 🎯 /admin/pushConfig → AI-generated config push
router.post('/admin/pushConfig', verifyAdmin, async (req, res) => {
  const { site_url, game } = req.body
  if (!site_url || !game) return res.status(400).send('Missing site_url or game')
  const config = await generateConfig({ site_url, game })
  try {
    await supabase.from('game_configs').insert([{ site_url, game, config }])
    res.redirect('/admin?pushed=1')
  } catch (err) {
    console.error('❌ Config push error:', err.message)
    res.status(500).send('Config push failed')
  }
})

export default router
