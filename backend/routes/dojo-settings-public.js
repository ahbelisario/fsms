const express = require('express');
const router = express.Router();

/**
 * GET /api/dojo-settings/public
 * Obtener solo información pública del dojo (sin políticas completas)
 * No requiere autenticación
 */
router.get('/', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  fsms_pool.query(`
    SELECT 
      dojo_name, 
      short_name, 
      logo_url,
      phone, 
      email, 
      website,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      facebook_url,
      instagram_url,
      twitter_url,
      currency,
      language
    FROM dojo_settings 
    WHERE id = 1
  `, (err, rows) => {
    if (err) {
      console.error('Error getting public dojo settings:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }

    if (rows.length === 0) {
      return res.json({ status: 'success', data: { dojo_name: 'FSMS' } });
    }

    res.json({ status: 'success', data: rows[0] });
  });
});

module.exports = router;