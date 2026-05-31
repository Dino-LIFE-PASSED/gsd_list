const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// GET /api/users/managers
router.get('/managers', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, created_at FROM users WHERE role='work_manager' ORDER BY created_at"
    )
    res.json(rows.map((r) => ({ id: r.id, username: r.username, createdAt: r.created_at })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users/managers
router.post('/managers', requireAuth, async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' })

    const { rows } = await pool.query('SELECT 1 FROM users WHERE username=$1', [username])
    if (rows.length) return res.status(409).json({ message: 'Username already exists' })

    const id = uuidv4()
    await pool.query(
      'INSERT INTO users (id, username, password, role) VALUES ($1,$2,$3,$4)',
      [id, username, password, 'work_manager']
    )
    res.status(201).json({ id, username, role: 'work_manager' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/users/managers/:id
router.delete('/managers/:id', requireAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1 AND role='work_manager'", [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
