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

function base64Decode(value) {
  return Buffer.from(value, 'base64').toString('utf8');
}

/**
 * GET /api/users
 * Lista usuarios (admin)
 */
router.get('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT id, username, name, lastname, email, role, active, created_at FROM users WHERE active = 1 ORDER BY id DESC', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT COUNT(*) AS total_rows FROM users WHERE active = 1', (err, rows) => {
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
 * GET /api/users/:id
 */
router.get('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'SELECT id, username, name, lastname, email, role, active, created_at FROM users WHERE id = ?',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
      if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data: rows[0] });
    }
  );
});

/**
 * POST /api/users
 * Body: { username, password, name, lastname, email, role }
 */
router.post('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { username, password, name, lastname, email, role } = req.body;

  if (!username || !password || !name || !lastname) {
    return res.status(400).json({ status: 'error', message: 'Username, Password, Name, Lastname and Email are required' });
  }

  if (!password || String(password).length < 8) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 8 chars' });
  }

  try {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = 'INSERT INTO users (username, password, name, lastname, email, role, active) VALUES (?, ?, ?, ?, ?, ?, 1)';
    fsms_pool.query(sql, [username, password_hash, name, lastname, email, role ?? 'user'], (err, result) => {
      if (err) {
        // Si username es UNIQUE, aquí puedes mapear el error a 409
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Insert failed' });
      }

      const id = result.insertId;

      res.status(201).json({
        status: 'success',
        data: { id, username, name, lastname, email, role: role ?? 'user', active: 1 }
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Hash failed' });
  }
});

/**
 * PUT /api/users/:id
 * Actualiza datos (no password)
 */
router.put('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  const requesterId = Number(req.user.sub);
  const targetId = Number(id);

  // Solo admin o dueño
  if (req.user.role !== 'admin' && requesterId !== targetId) {
    return res.status(403).json({ status: 'error', message: 'Not allowed' });
  }

  const { username, name, lastname, email, role, active } = req.body;

  // Solo admin puede cambiar role/active
  if (req.user.role !== 'admin' && (role !== undefined || active !== undefined)) {
    return res.status(403).json({
      status: 'error',
      message: 'Only admin can change role/active'
    });
  }
  
  // Actualiza solo campos permitidos para no-admin
  // (Si admin, puedes incluir role/active en otro SQL)
  const sql = req.user.role === 'admin'
    ? 'UPDATE users SET username = ?, name = ?, lastname = ?, email = ?, role = ?, active = ? WHERE id = ?'
    : 'UPDATE users SET username = ?, name = ?, lastname = ?, email = ? WHERE id = ?';

  const params = req.user.role === 'admin'
    ? [username, name, lastname, email, role ?? 'user', active ?? 1, id]
    : [username, name, lastname, email, id];

  fsms_pool.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'User updated' });
  });
});

/**
 * POST /api/users/:id/checkpassword
 * Solo verificar password
 * Body: { password }
 */
router.post('/:id/checkpassword', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  const requesterId = Number(req.user.sub);
  const targetId = Number(id);

  // Solo admin o dueño
  if (req.user.role !== 'admin' && requesterId !== targetId) {
    return res.status(403).json({ status: 'error', message: 'Not allowed' });
  }

  const password = base64Decode(req.body.password);

  const sql = `SELECT password, active FROM users WHERE id = ? LIMIT 1`;

  fsms_pool.query(sql, [id], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.active === 0) {
      return res.status(403).json({ status: 'error', message: 'User is disabled' });
    }

    try {
      
      const ok = await bcrypt.compare(password, user.password);

      if (!ok) { 
          return res.json({ status: 'error', message: 'Password dont match' });
        } else {
          return res.json({ status: 'success', message: 'Password match' });
        }

    } catch (e) {
      console.error(e);
      return res.status(500).json({ status: 'error', message: 'Auth failed' });
    }
  });  
});


/**
 * PATCH /api/users/:id/password
 * Cambiar password
 * Body: { oldPassword, newPassword }
 */
router.patch('/:id/password', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  const requesterId = Number(req.user.sub);
  const targetId = Number(id);

  // Solo admin o dueño
  if (req.user.role !== 'admin' && requesterId !== targetId) {
    return res.status(403).json({ status: 'error', message: 'Not allowed' });
  }

  const oldPassword = base64Decode(req.body.password);
  const newPassword = base64Decode(req.body.newPassword);

  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 8 chars' });
  }

  const sql = `SELECT password, active FROM users WHERE id = ? LIMIT 1`;

  fsms_pool.query(sql, [id], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.active === 0) {
      return res.status(403).json({ status: 'error', message: 'User is disabled' });
    }

    try {
      
      const ok = await bcrypt.compare(oldPassword, user.password);
      if (!ok) return res.status(403).json({ status: 'error', message: 'Invalid credentials' });

      try {
        const hash = await bcrypt.hash(newPassword, 12);

        fsms_pool.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hash, id],
          (err, result) => {
            if (err) return res.status(500).json({ status: 'error', message: 'Password update failed' });
            if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
            res.json({ status: 'success', message: 'Password updated' });
          }
        );
      } catch (e) {
        res.status(500).json({ status: 'error', message: 'Hash failed' });
      }

    } catch (e) {
      console.error(e);
      return res.status(500).json({ status: 'error', message: 'Auth failed' });
    }
  });  
});

/**
 * DELETE /api/users/:id
 * En muchos sistemas se recomienda "soft delete" (active=0) en vez de borrar.
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  // Soft delete recomendado:
  fsms_pool.query('UPDATE users SET active = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Delete failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'User disabled' });
  });
});

module.exports = { router, requireAdmin };
