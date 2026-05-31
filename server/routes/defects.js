const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { pool, getDefects } = require('../db')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// GET /api/defects?team=electrical
router.get('/', async (req, res) => {
  try {
    const defects = await getDefects(req.query.team || null)
    res.json(defects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/defects  (client only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { header, description, teamId, statusId, images } = req.body
    const id = uuidv4()

    await pool.query(
      'INSERT INTO defects (id, header, description, team_id, status_id) VALUES ($1,$2,$3,$4,$5)',
      [id, header, description || '', teamId, statusId || 'pending']
    )

    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          'INSERT INTO defect_images (id, defect_id, url, idx) VALUES ($1,$2,$3,$4)',
          [uuidv4(), id, images[i], i]
        )
      }
    }

    const [defect] = await getDefects()
    res.status(201).json((await getDefects()).find((d) => d.id === id))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/defects/:id  (client only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { header, description, teamId, images } = req.body

    await pool.query(
      'UPDATE defects SET header=$1, description=$2, team_id=$3 WHERE id=$4',
      [header, description || '', teamId, id]
    )

    await pool.query('DELETE FROM defect_images WHERE defect_id=$1', [id])
    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          'INSERT INTO defect_images (id, defect_id, url, idx) VALUES ($1,$2,$3,$4)',
          [uuidv4(), id, images[i], i]
        )
      }
    }

    const all = await getDefects()
    res.json(all.find((d) => d.id === id))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/defects/:id  (client only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM defects WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/defects/:id/status  (all roles)
router.patch('/:id/status', async (req, res) => {
  try {
    await pool.query('UPDATE defects SET status_id=$1 WHERE id=$2', [req.body.statusId, req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/defects/:id/approve  (client only)
router.patch('/:id/approve', requireAuth, async (req, res) => {
  try {
    const { username } = req.session.user
    const now = new Date().toISOString()
    await pool.query(
      'UPDATE defects SET approved=TRUE, approved_by=$1, approved_at=$2 WHERE id=$3',
      [username, now, req.params.id]
    )
    res.json({ ok: true, approvedBy: username, approvedAt: now })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/defects/:id/comments  (all roles)
router.post('/:id/comments', async (req, res) => {
  try {
    const { author, text, images } = req.body
    const id = uuidv4()
    const now = new Date().toISOString()

    await pool.query(
      'INSERT INTO comments (id, defect_id, author, text, created_at) VALUES ($1,$2,$3,$4,$5)',
      [id, req.params.id, author, text || '', now]
    )

    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          'INSERT INTO comment_images (id, comment_id, url, idx) VALUES ($1,$2,$3,$4)',
          [uuidv4(), id, images[i], i]
        )
      }
    }

    res.status(201).json({ id, author, text: text || '', images: images || [], createdAt: now })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
