const express = require('express');
const router = express.Router();

// Middleware simple para admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

// =====================================================
// RUTAS PARA USUARIOS (historial de sus propios pagos)
// =====================================================

/**
 * GET /api/payments/my-history
 * Obtener historial de pagos del usuario autenticado
 */
router.get('/my-history', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  const limit  = parseInt(req.query.limit)  || 10;
  const offset = parseInt(req.query.offset) || 0;

  fsms_pool.query(
    `SELECT 
      i.id,
      i.description,
      i.amount,
      i.currency,
      i.income_date,
      i.income_method,
      i.reference,
      i.status,
      it.name as income_type_name
    FROM incomes i
    LEFT JOIN income_types it ON i.income_type = it.id
    WHERE i.user_id = ?
    ORDER BY i.income_date DESC
    LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, payments) => {
      if (err) {
        console.error('Error fetching payment history:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Error al obtener historial de pagos'
        });
      }

      fsms_pool.query(
        'SELECT COUNT(*) as total FROM incomes WHERE user_id = ?',
        [userId],
        (countErr, countResult) => {
          if (countErr) {
            console.error('Error counting payments:', countErr);
            return res.status(500).json({
              status: 'error',
              message: 'Error al contar pagos'
            });
          }

          const total = countResult[0].total;

          res.json({
            status: 'success',
            data: {
              payments,
              pagination: {
                total,
                limit,
                offset,
                hasMore: (offset + limit) < total
              }
            }
          });
        }
      );
    }
  );
});

/**
 * GET /api/payments/my-stats
 * Obtener estadísticas de pagos del usuario
 */
router.get('/my-stats', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  fsms_pool.query(
    `SELECT 
      COUNT(*) as total_payments,
      SUM(amount) as total_paid,
      MAX(income_date) as last_payment_date,
      MIN(income_date) as first_payment_date,
      currency
    FROM incomes
    WHERE user_id = ?
    GROUP BY currency`,
    [userId],
    (err, stats) => {
      if (err) {
        console.error('Error fetching payment stats:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Error al obtener estadísticas'
        });
      }

      res.json({
        status: 'success',
        data: stats.length > 0 ? stats[0] : {
          total_payments:    0,
          total_paid:        0,
          last_payment_date: null,
          first_payment_date: null,
          currency:          'MXN'
        }
      });
    }
  );
});

/**
 * GET /api/payments/my-monthly-status
 * Devuelve pagos agrupados por mes de los últimos 4 meses (mes actual + 3 anteriores).
 * Solo considera pagos con status = 'applied'.
 * Usado por el score card de PaymentHistoryScreen.
 */
router.get('/my-monthly-status', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  fsms_pool.query(
    `SELECT 
      DATE_FORMAT(income_date, '%Y-%m') as month,
      COUNT(*)                          as payment_count,
      SUM(amount)                       as total_amount,
      currency,
      MAX(income_date)                  as last_payment_date
    FROM incomes
    WHERE 
      user_id = ?
      AND status = 'applied'
      AND income_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01')
    GROUP BY DATE_FORMAT(income_date, '%Y-%m'), currency
    ORDER BY month DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching monthly payment status:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Error al obtener estado mensual de pagos'
        });
      }

      res.json({ status: 'success', data: rows });
    }
  );
});

/**
 * GET /api/payments/my-history/:id
 * Obtener detalle de un pago específico del usuario
 */
router.get('/my-history/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId    = req.user.id;
  const paymentId = req.params.id;

  fsms_pool.query(
    `SELECT 
      i.*,
      it.name as income_type_name,
      u.name as user_name,
      u.lastname as user_lastname,
      u.email as user_email,
      creator.name as created_by_name,
      creator.lastname as created_by_lastname
    FROM incomes i
    LEFT JOIN income_types it ON i.income_type = it.id
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN users creator ON i.created_by = creator.id
    WHERE i.id = ? AND i.user_id = ?
    LIMIT 1`,
    [paymentId, userId],
    (err, payments) => {
      if (err) {
        console.error('Error fetching payment detail:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Error al obtener detalle del pago'
        });
      }

      if (payments.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Pago no encontrado'
        });
      }

      res.json({ status: 'success', data: payments[0] });
    }
  );
});

// =====================================================
// RUTAS PARA ADMIN (gestión completa de incomes)
// =====================================================

/**
 * GET /api/payments
 * Admin: obtener todos los incomes
 */
router.get('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query(
          `SELECT 
            i.id, 
            i.description, 
            i.membership_id, 
            i.user_id, 
            i.income_date, 
            i.amount, 
            i.currency, 
            i.income_method, 
            i.reference, 
            i.status, 
            i.income_type, 
            i.created_by,
            it.name as income_type_name,
            u.name as user_name,
            u.lastname as user_lastname
          FROM incomes i
          LEFT JOIN income_types it ON i.income_type = it.id
          LEFT JOIN users u ON i.user_id = u.id
          ORDER BY i.income_date DESC`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query(
          'SELECT COUNT(*) AS total_rows FROM incomes',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows[0].total_rows);
          }
        );
      })
    ]);

    res.json({ status: 'success', total_rows: count, data: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'DB error' });
  }
});

/**
 * GET /api/payments/:id
 * Admin: obtener income por ID
 */
router.get('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    `SELECT 
      i.*,
      it.name as income_type_name,
      u.name as user_name,
      u.lastname as user_lastname,
      u.email as user_email,
      creator.name as created_by_name,
      creator.lastname as created_by_lastname
    FROM incomes i
    LEFT JOIN income_types it ON i.income_type = it.id
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN users creator ON i.created_by = creator.id
    WHERE i.id = ?`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
      if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data: rows[0] });
    }
  );
});

/**
 * POST /api/payments
 * Admin: crear income
 */
router.post('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const {
    description,
    membership_id,
    user_id,
    income_date,
    amount,
    currency,
    income_method,
    reference,
    status,
    income_type,
    created_by
  } = req.body;

  if (!user_id || !income_date || !amount || !currency || !income_type) {
    return res.status(400).json({
      status: 'error',
      message: 'user_id, income_date, amount, currency e income_type son requeridos'
    });
  }

  try {
    const sql = `INSERT INTO incomes 
      (description, membership_id, user_id, income_date, amount, currency, income_method, reference, status, income_type, created_by) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

    fsms_pool.query(
      sql,
      [description, membership_id, user_id, income_date, amount, currency, income_method, reference, status, income_type, created_by],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: 'error', message: 'Insert failed' });
        }

        res.status(201).json({
          status: 'success',
          data: {
            id: result.insertId,
            description,
            membership_id,
            user_id,
            income_date,
            amount,
            currency,
            income_method,
            reference,
            status,
            income_type,
            created_by
          }
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Insert failed' });
  }
});

/**
 * PUT /api/payments/:id
 * Admin: actualizar income
 */
router.put('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  const {
    description,
    membership_id,
    user_id,
    income_date,
    amount,
    currency,
    income_method,
    reference,
    status,
    income_type,
    created_by
  } = req.body;

  const sql = `UPDATE incomes SET 
    description   = ?, 
    membership_id = ?, 
    user_id       = ?, 
    income_date   = ?, 
    amount        = ?, 
    currency      = ?, 
    income_method = ?, 
    reference     = ?, 
    status        = ?, 
    income_type   = ?, 
    created_by    = ? 
    WHERE id = ?`;

  fsms_pool.query(
    sql,
    [description, membership_id, user_id, income_date, amount, currency, income_method, reference, status, income_type, created_by, id],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', message: 'Income updated' });
    }
  );
});

/**
 * DELETE /api/payments/:id
 * Admin: eliminar income
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'DELETE FROM incomes WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Delete failed' });
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', message: 'Income deleted' });
    }
  );
});

module.exports = { router, requireAdmin };