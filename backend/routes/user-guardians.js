const express = require('express');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

/**
 * POST /api/user-guardians
 * Asignar tutor a un menor (admin)
 * Body: { guardian_user_id, minor_user_id, relationship }
 */
router.post('/', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { guardian_user_id, minor_user_id, relationship } = req.body;

  if (!guardian_user_id || !minor_user_id) {
    return res.status(400).json({ status: 'error', message: 'guardian_user_id y minor_user_id son requeridos' });
  }

  if (Number(guardian_user_id) === Number(minor_user_id)) {
    return res.status(400).json({ status: 'error', message: 'El tutor y el menor no pueden ser el mismo usuario' });
  }

  fsms_pool.query(
    `INSERT INTO user_guardians (guardian_user_id, minor_user_id, relationship) VALUES (?, ?, ?)`,
    [guardian_user_id, minor_user_id, relationship || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ status: 'error', message: 'Esta relación tutor-menor ya existe' });
        }
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }
      res.status(201).json({
        status: 'success',
        data: {
          id: result.insertId,
          guardian_user_id,
          minor_user_id,
          relationship: relationship || null
        }
      });
    }
  );
});

/**
 * GET /api/user-guardians/minor/:minorId
 * Ver tutor(es) de un menor
 */
router.get('/minor/:minorId', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { minorId } = req.params;

  const requesterId = Number(req.user.id);
  const targetId = Number(minorId);

  if (req.user.role !== 'admin' && requesterId !== targetId) {
    return res.status(403).json({ status: 'error', message: 'Not allowed' });
  }

  fsms_pool.query(
    `SELECT 
       ug.id,
       ug.relationship,
       ug.created_at,
       u.id AS guardian_id,
       u.name AS guardian_name,
       u.lastname AS guardian_lastname,
       u.email AS guardian_email,
       up.phone AS guardian_phone
     FROM user_guardians ug
     INNER JOIN users u ON u.id = ug.guardian_user_id
     LEFT JOIN user_profiles up ON up.user_id = ug.guardian_user_id
     WHERE ug.minor_user_id = ?
     ORDER BY ug.created_at ASC`,
    [minorId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }
      res.json({ status: 'success', data: rows });
    }
  );
});

/**
 * GET /api/user-guardians/guardian/:guardianId
 * Ver menores a cargo de un tutor
 */
router.get('/guardian/:guardianId', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { guardianId } = req.params;

  const requesterId = Number(req.user.id);
  const targetId = Number(guardianId);

  if (req.user.role !== 'admin' && requesterId !== targetId) {
    return res.status(403).json({ status: 'error', message: 'Not allowed' });
  }

  fsms_pool.query(
    `SELECT 
       ug.id,
       ug.relationship,
       ug.created_at,
       u.id AS minor_id,
       u.name AS minor_name,
       u.lastname AS minor_lastname,
       u.email AS minor_email,
       up.date_of_birth AS minor_date_of_birth
     FROM user_guardians ug
     INNER JOIN users u ON u.id = ug.minor_user_id
     LEFT JOIN user_profiles up ON up.user_id = ug.minor_user_id
     WHERE ug.guardian_user_id = ?
     ORDER BY u.name ASC`,
    [guardianId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }
      res.json({ status: 'success', data: rows });
    }
  );
});

/**
 * DELETE /api/user-guardians/:id
 * Eliminar relación tutor-menor (admin)
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'DELETE FROM user_guardians WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
      }
      res.json({ status: 'success', message: 'Relación eliminada' });
    }
  );
});

module.exports = router;