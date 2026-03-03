const express = require('express');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

/**
 * GET /api/class-enrollments/my-enrollments
 * Obtiene las inscripciones del usuario actual
 */
router.get('/my-enrollments', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  fsms_pool.query(`
    SELECT 
      ce.*,
      sc.title as class_title,
      sc.scheduled_date,
      sc.start_time,
      sc.end_time,
      sc.discipline_id,
      d.name as discipline_name,
      u.name as instructor_name,
      u.lastname as instructor_lastname
    FROM class_enrollments ce
    LEFT JOIN scheduled_classes sc ON ce.class_id = sc.id
    LEFT JOIN disciplines d ON sc.discipline_id = d.id
    LEFT JOIN users u ON sc.instructor_id = u.id
    WHERE ce.user_id = ?
    ORDER BY sc.scheduled_date DESC, sc.start_time DESC
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Error getting user enrollments:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    res.json({ status: 'success', data: rows });
  });
});


/**
 * GET /api/class-enrollments/my-attendance-stats
 * Estadísticas de asistencia del usuario actual
 */
router.get('/my-attendance-stats', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  fsms_pool.query(`
    SELECT 
      COUNT(*) as total_enrollments,
      SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended,
      SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) as pending,
      ROUND(
        (SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(SUM(CASE WHEN status IN ('attended', 'no_show') THEN 1 ELSE 0 END), 0),
        2
      ) as attendance_rate
    FROM class_enrollments
    WHERE user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Error getting attendance stats:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    res.json({ status: 'success', data: rows[0] });
  });
});

/**
 * GET /api/class-enrollments/attendance-stats/:userId
 * Estadísticas de asistencia de un alumno
 */
router.get('/attendance-stats/:userId', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { userId } = req.params;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  // Solo admin o el propio usuario pueden ver sus stats
  if (requesterRole !== 'admin' && Number(requesterId) !== Number(userId)) {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }

  fsms_pool.query(`
    SELECT 
      COUNT(*) as total_enrollments,
      SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended,
      SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) as pending,
      ROUND(
        (SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(SUM(CASE WHEN status IN ('attended', 'no_show') THEN 1 ELSE 0 END), 0),
        2
      ) as attendance_rate
    FROM class_enrollments
    WHERE user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Error getting attendance stats:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    res.json({ status: 'success', data: rows[0] });
  });
});

/**
 * GET /api/class-enrollments/class/:classId
 * Obtiene las inscripciones de una clase específica
 */
router.get('/class/:classId', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { classId } = req.params;

  fsms_pool.query(`
    SELECT 
      ce.*,
      u.name as student_name,
      u.lastname as student_lastname,
      u.email as student_email
    FROM class_enrollments ce
    LEFT JOIN users u ON ce.user_id = u.id
    WHERE ce.class_id = ?
    ORDER BY ce.enrollment_date ASC
  `, [classId], (err, rows) => {
    if (err) {
      console.error('Error getting class enrollments:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

/**
 * GET /api/class-enrollments
 * Lista todas las inscripciones (solo admin)
 */
router.get('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query(`
          SELECT 
            ce.*,
            sc.title as class_title,
            sc.scheduled_date,
            sc.start_time,
            u.name as student_name,
            u.lastname as student_lastname
          FROM class_enrollments ce
          LEFT JOIN scheduled_classes sc ON ce.class_id = sc.id
          LEFT JOIN users u ON ce.user_id = u.id
          ORDER BY ce.enrollment_date DESC
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT COUNT(*) AS total_rows FROM class_enrollments', (err, rows) => {
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
 * POST /api/class-enrollments/enroll
 * Inscribir al usuario actual en una clase
 */
router.post('/enroll', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;
  const { class_id, notes } = req.body;

  if (!class_id) {
    return res.status(400).json({ status: 'error', message: 'class_id is required' });
  }

  // Verificar capacidad de la clase
  fsms_pool.query(
    'SELECT max_capacity, (SELECT COUNT(*) FROM class_enrollments WHERE class_id = ? AND status = "enrolled") as current_enrollment FROM scheduled_classes WHERE id = ?',
    [class_id, class_id],
    (err, rows) => {
      if (err) {
        console.error('Error checking class capacity:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Class not found' });
      }

      const { max_capacity, current_enrollment } = rows[0];

      if (current_enrollment >= max_capacity) {
        return res.status(400).json({ status: 'error', message: 'Class is full' });
      }

      // Inscribir al usuario
      const sql = 'INSERT INTO class_enrollments (class_id, user_id, notes) VALUES (?, ?, ?)';
      fsms_pool.query(sql, [class_id, userId, notes || null], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ status: 'error', message: 'Ya estás inscrito en esta clase' });
          }
          console.error('Error enrolling in class:', err);
          return res.status(500).json({ status: 'error', message: 'Insert failed' });
        }

        res.status(201).json({
          status: 'success',
          data: { id: result.insertId, class_id, user_id: userId }
        });
      });
    }
  );
});

/**
 * POST /api/class-enrollments
 * Inscribir a cualquier usuario (solo admin)
 */
router.post('/', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { class_id, user_id, notes } = req.body;

  if (!class_id || !user_id) {
    return res.status(400).json({ status: 'error', message: 'class_id and user_id are required' });
  }

  // Verificar capacidad
  fsms_pool.query(
    'SELECT max_capacity, (SELECT COUNT(*) FROM class_enrollments WHERE class_id = ? AND status = "enrolled") as current_enrollment FROM scheduled_classes WHERE id = ?',
    [class_id, class_id],
    (err, rows) => {
      if (err) {
        console.error('Error checking class capacity:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Class not found' });
      }

      const { max_capacity, current_enrollment } = rows[0];

      if (current_enrollment >= max_capacity) {
        return res.status(400).json({ status: 'error', message: 'Class is full' });
      }

      // Inscribir
      const sql = 'INSERT INTO class_enrollments (class_id, user_id, notes) VALUES (?, ?, ?)';
      fsms_pool.query(sql, [class_id, user_id, notes || null], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ status: 'error', message: 'User already enrolled in this class' });
          }
          console.error('Error enrolling in class:', err);
          return res.status(500).json({ status: 'error', message: 'Insert failed' });
        }

        res.status(201).json({
          status: 'success',
          data: { id: result.insertId, class_id, user_id }
        });
      });
    }
  );
});

/**
 * DELETE /api/class-enrollments/cancel/:classId
 * Cancelar inscripción del usuario actual
 */
router.delete('/cancel/:classId', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;
  const { classId } = req.params;

  // Cambiar status a 'cancelled' en lugar de eliminar
  fsms_pool.query(
    'UPDATE class_enrollments SET status = "cancelled" WHERE class_id = ? AND user_id = ?',
    [classId, userId],
    (err, result) => {
      if (err) {
        console.error('Error cancelling enrollment:', err);
        return res.status(500).json({ status: 'error', message: 'Update failed' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Enrollment not found' });
      }
      res.json({ status: 'success', message: 'Enrollment cancelled' });
    }
  );
});

/**
 * DELETE /api/class-enrollments/:id
 * Eliminar inscripción (solo admin)
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query('DELETE FROM class_enrollments WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting enrollment:', err);
      return res.status(500).json({ status: 'error', message: 'Delete failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Not found' });
    }
    res.json({ status: 'success', message: 'Enrollment deleted' });
  });
});

/**
 * PUT /api/class-enrollments/:id/status
 * Actualizar status de inscripción (solo admin)
 */
router.put('/:id/status', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['enrolled', 'attended', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Invalid status' });
  }

  fsms_pool.query(
    'UPDATE class_enrollments SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.error('Error updating enrollment status:', err);
        return res.status(500).json({ status: 'error', message: 'Update failed' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
      }
      res.json({ status: 'success', message: 'Status updated' });
    }
  );
});

/**
 * POST /api/class-enrollments/mark-attendance
 * Marcar asistencia de múltiples alumnos a la vez (solo admin)
 */
router.post('/mark-attendance', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { attendances } = req.body; // Array de { enrollment_id, status }

  if (!attendances || !Array.isArray(attendances) || attendances.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'attendances array is required' 
    });
  }

  // Validar que todos los status sean válidos
  const validStatuses = ['attended', 'no_show', 'enrolled'];
  const invalidStatus = attendances.find(a => !validStatuses.includes(a.status));
  
  if (invalidStatus) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Invalid status. Use: attended, no_show, or enrolled' 
    });
  }

  // Actualizar cada inscripción
  const promises = attendances.map(({ enrollment_id, status }) => {
    return new Promise((resolve, reject) => {
      fsms_pool.query(
        'UPDATE class_enrollments SET status = ? WHERE id = ?',
        [status, enrollment_id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({ 
        status: 'success', 
        message: `${attendances.length} attendance records updated` 
      });
    })
    .catch(err => {
      console.error('Error marking attendance:', err);
      res.status(500).json({ status: 'error', message: 'Failed to update attendance' });
    });
});


module.exports = router;