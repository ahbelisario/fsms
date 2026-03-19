const express = require('express');
const router = express.Router();

/**
 * GET /api/rank-progress
 * Obtener progreso de grado del usuario autenticado
 * SIEMPRE retorna datos si el usuario tiene un grado asignado
 */
router.get('/', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  // Obtener datos del perfil del usuario
  fsms_pool.query(
    `SELECT 
      up.discipline_id,
      up.rank_id as current_rank_id,
      up.current_rank_start_date,
      up.next_exam_date,
      d.name as discipline_name,
      r.name as current_rank_name,
      r.order as current_rank_order,
      r.color as current_rank_color,
      r.requirements_months,
      r.requirements_classes
    FROM user_profiles up
    LEFT JOIN disciplines d ON up.discipline_id = d.id
    LEFT JOIN ranks r ON up.rank_id = r.id
    WHERE up.user_id = ?
    LIMIT 1`,
    [userId],
    (err, profileRows) => {
      if (err) {
        console.error('Error fetching rank progress:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (!profileRows || profileRows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Profile not found' });
      }

      const profile = profileRows[0];

      // Si no tiene rank, retornar has_rank: false
      if (!profile.current_rank_id) {
        return res.json({
          status: 'success',
          data: {
            has_rank: false,
            discipline_name: profile.discipline_name || null,
            current_rank: null,
            next_rank: null,
            next_exam_date: null,
            progress: null
          }
        });
      }

      // TIENE RANK - Obtener siguiente grado
      fsms_pool.query(
        `SELECT 
          id,
          name,
          \`order\`,
          color,
          requirements_months,
          requirements_classes
        FROM ranks
        WHERE discipline = ? AND \`order\` > ?
        ORDER BY \`order\` ASC
        LIMIT 1`,
        [profile.discipline_id, profile.current_rank_order || 0],
        (nextErr, nextRankRows) => {
          if (nextErr) {
            console.error('Error fetching next rank:', nextErr);
            return res.status(500).json({ status: 'error', message: 'DB error' });
          }

          const nextRank = nextRankRows && nextRankRows.length > 0 ? nextRankRows[0] : null;

          // Preparar respuesta base (siempre se retorna)
          const responseData = {
            has_rank: true,
            discipline_name: profile.discipline_name,
            current_rank: {
              id: profile.current_rank_id,
              name: profile.current_rank_name,
              order: profile.current_rank_order,
              color: profile.current_rank_color,
              start_date: profile.current_rank_start_date
            },
            next_rank: nextRank ? {
              id: nextRank.id,
              name: nextRank.name,
              order: nextRank.order,
              color: nextRank.color,
              requirements_months: nextRank.requirements_months,
              requirements_classes: nextRank.requirements_classes
            } : null,
            next_exam_date: profile.next_exam_date,
            progress: null  // Se calculará si hay datos
          };

          // Calcular días hasta próximo examen (si existe)
          let daysUntilExam = null;
          if (profile.next_exam_date) {
            try {
              const today = new Date();
              const examDate = new Date(profile.next_exam_date);
              const diffTime = examDate - today;
              daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } catch (e) {
              console.error('Error calculating days until exam:', e);
            }
          }

          // Si NO tiene current_rank_start_date, retornar solo con días hasta examen
          if (!profile.current_rank_start_date) {
            if (daysUntilExam !== null) {
              responseData.progress = {
                months_elapsed: null,
                attendance_count: null,
                months_progress: null,
                classes_progress: null,
                overall_progress: null,
                days_until_exam: daysUntilExam,
                meets_time_requirement: false,
                meets_class_requirement: false,
                ready_for_exam: false
              };
            }
            return res.json({ status: 'success', data: responseData });
          }

          // SI tiene current_rank_start_date, calcular progreso completo
          const startDate = new Date(profile.current_rank_start_date);
          const today = new Date();
          const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                            (today.getMonth() - startDate.getMonth());

          // Obtener asistencias desde que obtuvo el grado actual
          fsms_pool.query(
            `SELECT COUNT(*) as attendance_count
             FROM class_enrollments ce
             WHERE ce.user_id = ?
             AND ce.status = 'attended'
             AND ce.enrollment_date >= ?`,
            [userId, profile.current_rank_start_date],
            (attendErr, attendRows) => {
              if (attendErr) {
                console.error('Error counting attendance:', attendErr);
              }

              const attendanceCount = attendRows && attendRows[0] ? attendRows[0].attendance_count : 0;

              // Si hay siguiente rank, calcular progreso
              if (nextRank) {
                const monthsProgress = nextRank.requirements_months > 0 
                  ? Math.min((monthsDiff / nextRank.requirements_months) * 100, 100)
                  : 100;

                const classesProgress = nextRank.requirements_classes > 0
                  ? Math.min((attendanceCount / nextRank.requirements_classes) * 100, 100)
                  : 100;

                const overallProgress = Math.floor((monthsProgress + classesProgress) / 2);

                const meetsTimeRequirement = monthsDiff >= (nextRank.requirements_months || 0);
                const meetsClassRequirement = attendanceCount >= (nextRank.requirements_classes || 0);

                responseData.progress = {
                  months_elapsed: monthsDiff,
                  attendance_count: attendanceCount,
                  months_progress: Math.floor(monthsProgress),
                  classes_progress: Math.floor(classesProgress),
                  overall_progress: overallProgress,
                  days_until_exam: daysUntilExam,
                  meets_time_requirement: meetsTimeRequirement,
                  meets_class_requirement: meetsClassRequirement,
                  ready_for_exam: meetsTimeRequirement && meetsClassRequirement
                };
              } else {
                // No hay siguiente rank (grado máximo)
                responseData.progress = {
                  months_elapsed: monthsDiff,
                  attendance_count: attendanceCount,
                  months_progress: 100,
                  classes_progress: 100,
                  overall_progress: 100,
                  days_until_exam: daysUntilExam,
                  meets_time_requirement: true,
                  meets_class_requirement: true,
                  ready_for_exam: false  // No hay siguiente grado
                };
              }

              res.json({ status: 'success', data: responseData });
            }
          );
        }
      );
    }
  );
});

/**
 * GET /api/rank-progress/history
 * Obtener historial de grados del usuario
 */
router.get('/history', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  fsms_pool.query(
    `SELECT 
      rh.id,
      rh.awarded_date,
      rh.exam_score,
      rh.notes,
      r.name as rank_name,
      r.color as rank_color,
      r.order as rank_order,
      d.name as discipline_name,
      u.name as awarded_by_name,
      u.lastname as awarded_by_lastname
    FROM rank_history rh
    LEFT JOIN ranks r ON rh.rank_id = r.id
    LEFT JOIN disciplines d ON rh.discipline_id = d.id
    LEFT JOIN users u ON rh.awarded_by = u.id
    WHERE rh.user_id = ?
    ORDER BY rh.awarded_date DESC`,
    [userId],
    (err, history) => {
      if (err) {
        console.error('Error fetching rank history:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      res.json({
        status: 'success',
        data: history || []
      });
    }
  );
});

/**
 * POST /api/rank-progress/promote
 * Promover un estudiante a un nuevo grado
 * Solo admin/instructor
 */
router.post('/promote', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const promotedBy = req.user.id;

  const {
    user_id,
    new_rank_id,
    discipline_id,
    awarded_date,
    exam_score,
    notes,
    next_exam_date
  } = req.body;

  // Validaciones
  if (!user_id || !new_rank_id || !discipline_id) {
    return res.status(400).json({
      status: 'error',
      message: 'user_id, new_rank_id y discipline_id son requeridos'
    });
  }

  // Verificar que el nuevo rank existe y es de la disciplina correcta
  fsms_pool.query(
    `SELECT id, name, \`order\` FROM ranks WHERE id = ? AND discipline = ?`,
    [new_rank_id, discipline_id],
    (rankErr, rankRows) => {
      if (rankErr) {
        console.error('Error validating rank:', rankErr);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (!rankRows || rankRows.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Rank no válido para esta disciplina'
        });
      }

      const newRank = rankRows[0];

      // Insertar en rank_history
      fsms_pool.query(
        `INSERT INTO rank_history 
        (user_id, rank_id, discipline_id, awarded_date, exam_score, notes, awarded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          new_rank_id,
          discipline_id,
          awarded_date || new Date().toISOString().slice(0, 10),
          exam_score || null,
          notes || null,
          promotedBy
        ],
        (histErr, histResult) => {
          if (histErr) {
            console.error('Error inserting rank history:', histErr);
            return res.status(500).json({ status: 'error', message: 'Error al guardar historial' });
          }

          // Actualizar user_profiles con el nuevo rank
          fsms_pool.query(
            `UPDATE user_profiles 
            SET 
              rank_id = ?,
              current_rank_start_date = ?,
              next_exam_date = ?
            WHERE user_id = ?`,
            [
              new_rank_id,
              awarded_date || new Date().toISOString().slice(0, 10),
              next_exam_date || null,
              user_id
            ],
            (updateErr) => {
              if (updateErr) {
                console.error('Error updating user profile:', updateErr);
                return res.status(500).json({ status: 'error', message: 'Error al actualizar perfil' });
              }

              res.json({
                status: 'success',
                message: `Estudiante promovido a ${newRank.name}`,
                data: {
                  history_id: histResult.insertId,
                  new_rank: newRank,
                  awarded_date: awarded_date || new Date().toISOString().slice(0, 10)
                }
              });
            }
          );
        }
      );
    }
  );
});

/**
 * GET /api/rank-progress/pending-exams
 * Obtener estudiantes listos para examen (admin/instructor)
 */
router.get('/pending-exams', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  fsms_pool.query(
    `SELECT 
      u.id as user_id,
      u.name,
      u.lastname,
      up.discipline_id,
      up.rank_id,
      up.current_rank_start_date,
      up.next_exam_date,
      d.name as discipline_name,
      r.name as current_rank_name,
      r.color as current_rank_color,
      r.requirements_months,
      r.requirements_classes,
      next_r.id as next_rank_id,
      next_r.name as next_rank_name,
      next_r.color as next_rank_color
    FROM users u
    INNER JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN disciplines d ON up.discipline_id = d.id
    LEFT JOIN ranks r ON up.rank_id = r.id
    LEFT JOIN ranks next_r ON next_r.discipline = up.discipline_id AND next_r.\`order\` = r.\`order\` + 1
    WHERE u.active = 1
      AND up.rank_id IS NOT NULL
      AND next_r.id IS NOT NULL
    ORDER BY up.next_exam_date ASC, u.lastname ASC`,
    (err, students) => {
      if (err) {
        console.error('Error fetching pending exams:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      // Para cada estudiante, calcular si cumple requisitos
      const promises = students.map(student => {
        return new Promise((resolve) => {
          // Si no tiene current_rank_start_date, no puede calcular progreso
          if (!student.current_rank_start_date) {
            const today = new Date();
            let daysUntilExam = null;
            if (student.next_exam_date) {
              const examDate = new Date(student.next_exam_date);
              const diffTime = examDate - today;
              daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return resolve({
              ...student,
              months_elapsed: null,
              attendance_count: null,
              meets_time_requirement: false,
              meets_class_requirement: false,
              ready_for_exam: false,
              days_until_exam: daysUntilExam
            });
          }

          // Calcular meses transcurridos
          const startDate = new Date(student.current_rank_start_date);
          const today = new Date();
          const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                            (today.getMonth() - startDate.getMonth());

          // Obtener asistencias
          fsms_pool.query(
            `SELECT COUNT(*) as attendance_count
             FROM class_enrollments
             WHERE user_id = ?
             AND status = 'attended'
             AND enrollment_date >= ?`,
            [student.user_id, student.current_rank_start_date],
            (attendErr, attendRows) => {
              const attendanceCount = attendRows && attendRows[0] ? attendRows[0].attendance_count : 0;

              const meetsTimeRequirement = monthsDiff >= (student.requirements_months || 0);
              const meetsClassRequirement = attendanceCount >= (student.requirements_classes || 0);
              const ready = meetsTimeRequirement && meetsClassRequirement;

              // Calcular días hasta examen
              let daysUntilExam = null;
              if (student.next_exam_date) {
                const examDate = new Date(student.next_exam_date);
                const diffTime = examDate - today;
                daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              }

              resolve({
                ...student,
                months_elapsed: monthsDiff,
                attendance_count: attendanceCount,
                meets_time_requirement: meetsTimeRequirement,
                meets_class_requirement: meetsClassRequirement,
                ready_for_exam: ready,
                days_until_exam: daysUntilExam
              });
            }
          );
        });
      });

      Promise.all(promises).then(results => {
        res.json({
          status: 'success',
          data: results
        });
      });
    }
  );
});

module.exports = router;