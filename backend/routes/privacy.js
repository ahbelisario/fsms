const express = require('express');
const router = express.Router();

const PRIVACY_VERSION = '1.0';

/**
 * POST /api/privacy/accept
 * Registra la aceptación del aviso de privacidad
 * Body: { version } (opcional, usa la versión actual si no se envía)
 */
router.post('/accept', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;
  const version = (req.body && req.body.version) ? req.body.version : PRIVACY_VERSION;

  fsms_pool.query(
    `UPDATE users 
     SET privacy_accepted = 1, 
         privacy_accepted_at = NOW(), 
         privacy_version = ? 
     WHERE id = ?`,
    [version, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      res.json({
        status: 'success',
        message: 'Privacy notice accepted',
        data: {
          privacy_accepted: true,
          privacy_accepted_at: new Date(),
          privacy_version: version
        }
      });
    }
  );
});

/**
 * GET /api/privacy/status
 * Devuelve el estado de aceptación del aviso del usuario autenticado
 */
router.get('/status', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const userId = req.user.id;

  fsms_pool.query(
    `SELECT privacy_accepted, privacy_accepted_at, privacy_version 
     FROM users WHERE id = ? LIMIT 1`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      const { privacy_accepted, privacy_accepted_at, privacy_version } = rows[0];
      const needs_update = privacy_accepted && privacy_version !== PRIVACY_VERSION;

      res.json({
        status: 'success',
        data: {
          privacy_accepted: !!privacy_accepted,
          privacy_accepted_at,
          privacy_version,
          current_version: PRIVACY_VERSION,
          needs_update
        }
      });
    }
  );
});


module.exports = router;