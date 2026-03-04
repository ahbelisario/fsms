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
            d.name as discipline_name,
            (SELECT COUNT(*) FROM class_enrollments WHERE class_id = sc.id AND status = 'enrolled') as current_enrollment
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
 * POST /api/scheduled-classes/recurring
 * Crear múltiples clases basadas en un patrón de recurrencia
 */
router.post('/recurring', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { 
    title, 
    discipline_id, 
    instructor_id, 
    start_time, 
    end_time, 
    max_capacity, 
    notes,
    start_date,        // Fecha de inicio (YYYY-MM-DD)
    recurrence_days,   // Array de días: [0,2,4] para Dom,Mar,Jue (0=Domingo)
    recurrence_end_date // Fecha límite (YYYY-MM-DD)
  } = req.body;

  // Validación
  if (!title || !start_date || !recurrence_days || !recurrence_end_date || !start_time || !end_time) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing required fields' 
    });
  }

  if (!Array.isArray(recurrence_days) || recurrence_days.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'recurrence_days must be a non-empty array' 
    });
  }

  // Función para generar fechas según el patrón
  function generateRecurringDates(startDate, endDate, daysOfWeek) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Asegurarse de que las fechas sean válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid dates');
    }

    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
      
      if (daysOfWeek.includes(dayOfWeek)) {
        dates.push(new Date(currentDate));
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  try {
    const dates = generateRecurringDates(start_date, recurrence_end_date, recurrence_days);
    
    if (dates.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No valid dates generated with the given pattern' 
      });
    }

    if (dates.length > 365) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Too many classes would be created (max 365). Adjust your date range.' 
      });
    }

    // Crear la clase padre primero
    const parentQuery = `
      INSERT INTO scheduled_classes 
      (title, discipline_id, instructor_id, scheduled_date, start_time, end_time, max_capacity, notes, is_recurring, recurrence_pattern, recurrence_days, recurrence_end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'weekly', ?, ?)
    `;

    const parentValues = [
      title,
      discipline_id || null,
      instructor_id || null,
      dates[0].toISOString().split('T')[0],
      start_time,
      end_time,
      max_capacity || 20,
      notes || null,
      JSON.stringify(recurrence_days),
      recurrence_end_date
    ];

    fsms_pool.query(parentQuery, parentValues, (err, parentResult) => {
      if (err) {
        console.error('Error creating parent class:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      const parentId = parentResult.insertId;

      // Crear las clases hijas (omitir la primera ya que es la clase padre)
      const childClasses = dates.slice(1).map(date => {
        return new Promise((resolve, reject) => {
          const childQuery = `
            INSERT INTO scheduled_classes 
            (title, discipline_id, instructor_id, scheduled_date, start_time, end_time, max_capacity, notes, is_recurring, parent_class_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)
          `;

          const childValues = [
            title,
            discipline_id || null,
            instructor_id || null,
            date.toISOString().split('T')[0],
            start_time,
            end_time,
            max_capacity || 20,
            notes || null,
            parentId
          ];

          fsms_pool.query(childQuery, childValues, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      });

      Promise.all(childClasses)
        .then(() => {
          res.json({ 
            status: 'success', 
            message: `Created ${dates.length} classes`,
            parent_id: parentId,
            total_classes: dates.length,
            dates: dates.map(d => d.toISOString().split('T')[0])
          });
        })
        .catch(err => {
          console.error('Error creating child classes:', err);
          res.status(500).json({ status: 'error', message: 'Failed to create all recurring classes' });
        });
    });

  } catch (error) {
    console.error('Error generating dates:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * DELETE /api/scheduled-classes/recurring/:parentId
 * Eliminar toda una serie de clases recurrentes
 */
router.delete('/recurring/:parentId', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { parentId } = req.params;

  // Eliminar la clase padre y todas las hijas en cascada
  const query = `
    DELETE FROM scheduled_classes 
    WHERE id = ? OR parent_class_id = ?
  `;

  fsms_pool.query(query, [parentId, parentId], (err, result) => {
    if (err) {
      console.error('Error deleting recurring classes:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }

    res.json({ 
      status: 'success', 
      message: `Deleted ${result.affectedRows} classes from the series` 
    });
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