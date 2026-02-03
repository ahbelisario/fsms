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

router.get('/payments/monthly-summary', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  const sql = `
    SELECT 
      DATE_FORMAT(income_date, '%Y-%m') AS month,
      SUM(amount) AS total
    FROM incomes
    WHERE status = ?
      AND income_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month
  `;

  fsms_pool.query(sql, ['applied'], (err, rows) => {
      if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
      if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
      res.json({ status: 'success', data: rows });
    }
  );
});


module.exports = { router, requireAdmin };
