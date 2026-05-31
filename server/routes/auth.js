const express = require('express')
const { pool } = require('../db')

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    )
    if (!rows.length) return res.status(401).json({ message: 'Incorrect username or password' })

    const user = rows[0]
    req.session.user = { id: user.id, username: user.username, role: user.role }
    res.json({ id: user.id, username: user.username, role: user.role })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: 'Not authenticated' })
  res.json(req.session.user)
})

module.exports = router
