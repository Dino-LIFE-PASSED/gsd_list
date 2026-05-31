require('dotenv').config()
const express = require('express')
const session = require('express-session')
const cors    = require('cors')
const path    = require('path')
const { initDb } = require('./db')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(session({
  secret:            process.env.SESSION_SECRET || 'gsd-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
}))

// Static image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/defects', require('./routes/defects'))
app.use('/api/users',   require('./routes/users'))
app.use('/api/upload',  require('./routes/upload'))

// Serve React (ต้องอยู่หลัง /api ทุกตัว)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))

// Start
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GSD API  →  http://0.0.0.0:${PORT}`)
  })
}).catch((err) => {
  console.error('DB init failed:', err.message)
  process.exit(1)
})
