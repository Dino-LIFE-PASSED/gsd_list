require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Run on startup: create tables + seed
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      username    TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL CHECK (role IN ('client','work_manager')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS defects (
      id           TEXT PRIMARY KEY,
      header       TEXT NOT NULL,
      description  TEXT DEFAULT '',
      team_id      TEXT NOT NULL,
      status_id    TEXT NOT NULL DEFAULT 'pending',
      approved     BOOLEAN DEFAULT FALSE,
      approved_by  TEXT,
      approved_at  TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS defect_images (
      id         TEXT PRIMARY KEY,
      defect_id  TEXT NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
      url        TEXT NOT NULL,
      idx        INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS comments (
      id         TEXT PRIMARY KEY,
      defect_id  TEXT NOT NULL REFERENCES defects(id) ON DELETE CASCADE,
      author     TEXT NOT NULL,
      text       TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS comment_images (
      id         TEXT PRIMARY KEY,
      comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      url        TEXT NOT NULL,
      idx        INT DEFAULT 0
    );
  `)

  // Seed default client account
  await pool.query(`
    INSERT INTO users (id, username, password, role)
    VALUES ('u-client', 'client', 'client123', 'client')
    ON CONFLICT (id) DO NOTHING
  `)

  console.log('✓ Database ready')
}

// Fetch all defects (optionally filtered by team) with images + comments
async function getDefects(teamId = null) {
  const { rows: defects } = teamId
    ? await pool.query('SELECT * FROM defects WHERE team_id = $1 ORDER BY created_at DESC', [teamId])
    : await pool.query('SELECT * FROM defects ORDER BY created_at DESC')

  if (!defects.length) return []

  const ids = defects.map((d) => d.id)
  const ph  = ids.map((_, i) => `$${i + 1}`).join(',')

  const { rows: images }   = await pool.query(`SELECT * FROM defect_images   WHERE defect_id  IN (${ph}) ORDER BY idx`, ids)
  const { rows: comments } = await pool.query(`SELECT * FROM comments         WHERE defect_id  IN (${ph}) ORDER BY created_at`, ids)

  const commentIds = comments.map((c) => c.id)
  let commentImages = []
  if (commentIds.length) {
    const cp = commentIds.map((_, i) => `$${i + 1}`).join(',')
    const res = await pool.query(`SELECT * FROM comment_images WHERE comment_id IN (${cp}) ORDER BY idx`, commentIds)
    commentImages = res.rows
  }

  // Group
  const imgByDefect   = groupBy(images,       'defect_id',  (r) => r.url)
  const cImgByComment = groupBy(commentImages, 'comment_id', (r) => r.url)
  const cByDefect     = {}

  comments.forEach((c) => {
    cByDefect[c.defect_id] = cByDefect[c.defect_id] || []
    cByDefect[c.defect_id].push({
      id:        c.id,
      author:    c.author,
      text:      c.text,
      images:    cImgByComment[c.id] || [],
      createdAt: c.created_at,
    })
  })

  return defects.map((d) => ({
    id:          d.id,
    header:      d.header,
    description: d.description,
    teamId:      d.team_id,
    statusId:    d.status_id,
    approved:    d.approved,
    approvedBy:  d.approved_by,
    approvedAt:  d.approved_at,
    images:      imgByDefect[d.id] || [],
    comments:    cByDefect[d.id]   || [],
    createdAt:   d.created_at,
  }))
}

function groupBy(rows, key, valFn) {
  return rows.reduce((acc, r) => {
    acc[r[key]] = acc[r[key]] || []
    acc[r[key]].push(valFn(r))
    return acc
  }, {})
}

module.exports = { pool, initDb, getDefects }
