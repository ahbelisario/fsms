const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const SALT_ROUNDS = 12;

// Middleware simple para admin (ejemplo)
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

/**
 * GET /api/memberships id, user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes
 */
router.get('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT id, user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes FROM memberships ORDER BY id ASC', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT COUNT(*) AS total_rows FROM memberships', (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0].total_rows);
        });
      })
    ]);

    res.json({
      status: 'success',
      total_rows: count,
      data: records
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'DB error' });
  }
});

/**
 * GET /api/memberships/:id
 */
router.get('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'SELECT id, user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes FROM memberships WHERE id = ?',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
      if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data: rows[0] });
    }
  );
});

/**
 * POST /api/memberships
 */
router.post('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes } = req.body;

  if (!user_id || !package_id || !start_date || !finish_date || !fee ) {
    return res.status(400).json({ status: 'error', message: 'Some fields are required' });
  }

  try {
    const sql = 'INSERT INTO memberships (user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes) VALUES (?,?,?,?,?,?,?,?)';
    fsms_pool.query(sql, [user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes], (err, result) => {
      if (err) {
        // Si username es UNIQUE, aquí puedes mapear el error a 409
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Insert failed' });
      }

      const id = result.insertId;

      res.status(201).json({
        status: 'success',
        data: { id, user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes }
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Hash failed' });
  }
});

/**
 * PUT /api/memberships/:id
 */
router.put('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  //const requesterId = Number(req.user.sub);
  //const targetId = Number(id);

  // Solo admin o dueño
  //if (req.user.role !== 'admin' && requesterId !== targetId) {
  //  return res.status(403).json({ status: 'error', message: 'Not allowed' });
  // }

  const { user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes } = req.body;
  
  // Actualiza solo campos permitidos para no-admin
  // (Si admin, puedes incluir role/active en otro SQL)
  const sql = 'UPDATE memberships SET user_id = ?, package_id = ?, start_date = ?, finish_date = ?, fee = ?, discounted_fee = ?, currency = ?, notes = ? WHERE id = ?';
  const params = [user_id, package_id, start_date, finish_date, fee, discounted_fee, currency, notes, id];

  fsms_pool.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'User updated' });
  });
});

/**
 * DELETE /api/memberships/:id
 * En muchos sistemas se recomienda "soft delete" (active=0) en vez de borrar.
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  // Soft delete recomendado:
  fsms_pool.query('DELETE FROM memberships WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Delete failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'User disabled' });
  });
});

module.exports = { router, requireAdmin };
