// server.js 🚀 SkySniper Master Backend v1.9.3

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from './routes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 8080

// 🔧 Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// 📦 Mount all SkySniper routes
app.use('/', routes)

// 🫀 Health check (heartbeat)
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: '🟢 SkySniper backend is alive',
    version: process.env.npm_package_version || '1.9.3',
    timestamp: new Date().toISOString()
  })
})

// 🏠 Root redirect to admin or login
app.get('/', (req, res) => {
  const token = req.cookies?.admin_token
  if (token === process.env.ADMIN_TOKEN) {
    return res.redirect('/admin')
  }
  res.redirect('/login')
})

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🔥 SkySniper backend running at ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`)
})
