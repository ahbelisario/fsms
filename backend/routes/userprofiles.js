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
 * GET /api/userprofiles
 * Lista usuarios (admin)
 */
router.get('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT id, user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes, created_at, updated_at FROM user_profiles ORDER BY id DESC', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT COUNT(*) AS total_rows FROM user_profiles', (err, rows) => {
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
 * GET /api/userprofiles/:id
 */
router.get('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'SELECT id, user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes, created_at, updated_at FROM user_profiles WHERE id = ?',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
      if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data: rows[0] });
    }
  );
});

/**
 * POST /api/userprofiles
 */
router.post('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes } = req.body;

  if (!name || !lastname || !user_id ) {
    return res.status(400).json({ status: 'error', message: 'Name and Lastname are required' });
  }

  try {
    const sql = 'INSERT INTO user_profiles (user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    fsms_pool.query(sql, [user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes], (err, result) => {
      if (err) {
        // Si username es UNIQUE, aquí puedes mapear el error a 409
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Insert failed' });
      }

      res.status(201).json({
        status: 'success',
        data: { user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes }
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Hash failed' });
  }
});

/**
 * PUT /api/userprofiles/:id
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

  const { user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes } = req.body;

  // Solo admin puede cambiar role/active
  if (req.user.role !== 'admin' && (role !== undefined || active !== undefined)) {
    return res.status(403).json({
      status: 'error',
      message: 'Only admin can change role/active'
    });
  }
  
  // Actualiza solo campos permitidos para no-admin
  // (Si admin, puedes incluir role/active en otro SQL)
  const sql = 'UPDATE user_profiles SET user_id = ?, name = ?, lastname = ?, gender = ?, date_of_birth = ?, nationality = ?, phone = ?, emergency_contact_name = ?, emergency_contact_phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, country = ?, postal_code = ?, discipline_id = ?, rank_id = ?, start_date = ?, instructor_name = ?, blood_type = ?, medical_notes = ? WHERE id = ?';
  const params = [user_id, name, lastname, gender, date_of_birth, nationality, phone, emergency_contact_name, emergency_contact_phone, address_line1, address_line2, city, state, country, postal_code, discipline_id, rank_id, start_date, blood_type, medical_notes];

  fsms_pool.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'User updated' });
  });
});

/**
 * DELETE /api/userprofiles/:id
 * En muchos sistemas se recomienda "soft delete" (active=0) en vez de borrar.
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  // Soft delete recomendado:
  fsms_pool.query('UPDATE user_profiles SET active = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Delete failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'User disabled' });
  });
});

module.exports = { router, requireAdmin };
