const express = require('express');
const router = express.Router();

// Middleware simple para admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

/**
 * GET /api/scheduled-classes
 * Lista todas las clases programadas
 */
router.get('/', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query(`
          SELECT 
            sc.*,
            u.name as instructor_name,
            u.lastname as instructor_lastname,
            d.name as discipline_name
          FROM scheduled_classes sc
          LEFT JOIN users u ON sc.instructor_id = u.id
          LEFT JOIN disciplines d ON sc.discipline_id = d.id
          ORDER BY sc.scheduled_date ASC, sc.start_time ASC
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT COUNT(*) AS total_rows FROM scheduled_classes', (err, rows) => {
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
    console.error('Error listing scheduled classes:', err);
    res.status(500).json({ status: 'error', message: 'DB error' });
  }
});

/**
 * GET /api/scheduled-classes/:id
 * Obtiene una clase específica
 */
router.get('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(`
    SELECT 
      sc.*,
      u.name as instructor_name,
      u.lastname as instructor_lastname,
      d.name as discipline_name
    FROM scheduled_classes sc
    LEFT JOIN users u ON sc.instructor_id = u.id
    LEFT JOIN disciplines d ON sc.discipline_id = d.id
    WHERE sc.id = ?
  `, [id], (err, rows) => {
    if (err) {
      console.error('Error getting scheduled class:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }
    res.json({ status: 'success', data: rows[0] });
  });
});

/**
 * POST /api/scheduled-classes
 * Crea una nueva clase programada
 */
router.post('/', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { 
    title, 
    discipline_id, 
    instructor_id, 
    scheduled_date, 
    start_time, 
    end_time,
    max_capacity,
    notes 
  } = req.body;

  // Validaciones
  if (!title || !instructor_id || !scheduled_date || !start_time || !end_time) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Required fields: title, instructor_id, scheduled_date, start_time, end_time' 
    });
  }

  const sql = `
    INSERT INTO scheduled_classes 
    (title, discipline_id, instructor_id, scheduled_date, start_time, end_time, max_capacity, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  fsms_pool.query(sql, [
    title, 
    discipline_id || null, 
    instructor_id, 
    scheduled_date, 
    start_time, 
    end_time,
    max_capacity || 20,
    notes || null
  ], (err, result) => {
    if (err) {
      console.error('Error creating scheduled class:', err);
      return res.status(500).json({ status: 'error', message: 'Insert failed' });
    }

    const id = result.insertId;

    res.status(201).json({
      status: 'success',
      data: { 
        id, 
        title, 
        discipline_id, 
        instructor_id, 
        scheduled_date, 
        start_time, 
        end_time,
        max_capacity: max_capacity || 20,
        notes
      }
    });
  });
});

/**
 * PUT /api/scheduled-classes/:id
 * Actualiza una clase programada
 */
router.put('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;
  const { 
    title, 
    discipline_id, 
    instructor_id, 
    scheduled_date, 
    start_time, 
    end_time,
    max_capacity,
    status,
    notes 
  } = req.body;

  // Validaciones
  if (!title || !instructor_id || !scheduled_date || !start_time || !end_time) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Required fields: title, instructor_id, scheduled_date, start_time, end_time' 
    });
  }

  const sql = `
    UPDATE scheduled_classes 
    SET title = ?, 
        discipline_id = ?, 
        instructor_id = ?, 
        scheduled_date = ?, 
        start_time = ?, 
        end_time = ?,
        max_capacity = ?,
        status = ?,
        notes = ?
    WHERE id = ?
  `;

  const params = [
    title, 
    discipline_id || null, 
    instructor_id, 
    scheduled_date, 
    start_time, 
    end_time,
    max_capacity || 20,
    status || 'scheduled',
    notes || null,
    id
  ];

  fsms_pool.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating scheduled class:', err);
      return res.status(500).json({ status: 'error', message: 'Update failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }
    res.json({ status: 'success', message: 'Class updated' });
  });
});

/**
 * DELETE /api/scheduled-classes/:id
 * Elimina una clase programada
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query('DELETE FROM scheduled_classes WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting scheduled class:', err);
      return res.status(500).json({ status: 'error', message: 'Delete failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }
    res.json({ status: 'success', message: 'Class deleted' });
  });
});

/**
 * GET /api/scheduled-classes/month/:year/:month
 * Obtiene clases de un mes específico
 */
router.get('/month/:year/:month', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { year, month } = req.params;

  fsms_pool.query(`
    SELECT 
      sc.*,
      u.name as instructor_name,
      u.lastname as instructor_lastname,
      d.name as discipline_name
    FROM scheduled_classes sc
    LEFT JOIN users u ON sc.instructor_id = u.id
    LEFT JOIN disciplines d ON sc.discipline_id = d.id
    WHERE YEAR(sc.scheduled_date) = ? AND MONTH(sc.scheduled_date) = ?
    ORDER BY sc.scheduled_date ASC, sc.start_time ASC
  `, [year, month], (err, rows) => {
    if (err) {
      console.error('Error getting classes by month:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

module.exports = router;