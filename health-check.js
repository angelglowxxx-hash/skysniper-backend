// health-check.js
import fetch from 'node-fetch'

fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/ping`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ Backend is alive:', data)
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Backend unreachable:', err.message)
    process.exit(1)
  })
