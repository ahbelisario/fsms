const express = require('express');
const router = express.Router();

// El requireAuth se pasa desde backend.js
// Lo recibimos como parámetro opcional por si viene del app.use global

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

/**
 * GET /api/dojo-settings
 * Obtener configuración completa del dojo
 * Requiere autenticación (cualquier usuario autenticado puede verla)
 */
router.get('/', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  fsms_pool.query('SELECT * FROM dojo_settings WHERE id = 1', (err, rows) => {
    if (err) {
      console.error('Error getting dojo settings:', err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }

    if (rows.length === 0) {
      // Si no existe, crear registro por defecto
      fsms_pool.query(
        `INSERT INTO dojo_settings (id, dojo_name) VALUES (1, 'FSMS')`,
        (insertErr) => {
          if (insertErr) {
            console.error('Error creating default dojo settings:', insertErr);
            return res.status(500).json({ status: 'error', message: 'DB error' });
          }

          // Obtener el registro recién creado
          fsms_pool.query('SELECT * FROM dojo_settings WHERE id = 1', (selectErr, newRows) => {
            if (selectErr) {
              console.error('Error getting new dojo settings:', selectErr);
              return res.status(500).json({ status: 'error', message: 'DB error' });
            }
            res.json({ status: 'success', data: newRows[0] });
          });
        }
      );
      return;
    }

    res.json({ status: 'success', data: rows[0] });
  });
});

/**
 * GET /api/dojo-settings/public
 * Obtener solo información pública del dojo (sin políticas completas)
 * No requiere autenticación
 */
router.get('/public', (req, res) => {
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
      currency
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

/**
 * PUT /api/dojo-settings
 * Actualizar configuración del dojo
 * Solo admin puede actualizar
 */
router.put('/', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  const {
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
    tax_id,
    legal_name,
    facebook_url,
    instagram_url,
    twitter_url,
    currency,
    timezone,
    language,
    privacy_policy,
    terms_conditions
  } = req.body;

  // Validaciones básicas
  if (dojo_name !== undefined && dojo_name.trim().length === 0) {
    return res.status(400).json({ status: 'error', message: 'El nombre del dojo es requerido' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ status: 'error', message: 'Email inválido' });
  }

  // Construir query dinámico solo con campos proporcionados
  const updates = [];
  const values = [];

  if (dojo_name !== undefined) { updates.push("dojo_name = ?"); values.push(dojo_name); }
  if (short_name !== undefined) { updates.push("short_name = ?"); values.push(short_name); }
  if (logo_url !== undefined) { updates.push("logo_url = ?"); values.push(logo_url); }
  if (phone !== undefined) { updates.push("phone = ?"); values.push(phone); }
  if (email !== undefined) { updates.push("email = ?"); values.push(email); }
  if (website !== undefined) { updates.push("website = ?"); values.push(website); }
  if (address_line1 !== undefined) { updates.push("address_line1 = ?"); values.push(address_line1); }
  if (address_line2 !== undefined) { updates.push("address_line2 = ?"); values.push(address_line2); }
  if (city !== undefined) { updates.push("city = ?"); values.push(city); }
  if (state !== undefined) { updates.push("state = ?"); values.push(state); }
  if (postal_code !== undefined) { updates.push("postal_code = ?"); values.push(postal_code); }
  if (country !== undefined) { updates.push("country = ?"); values.push(country); }
  if (tax_id !== undefined) { updates.push("tax_id = ?"); values.push(tax_id); }
  if (legal_name !== undefined) { updates.push("legal_name = ?"); values.push(legal_name); }
  if (facebook_url !== undefined) { updates.push("facebook_url = ?"); values.push(facebook_url); }
  if (instagram_url !== undefined) { updates.push("instagram_url = ?"); values.push(instagram_url); }
  if (twitter_url !== undefined) { updates.push("twitter_url = ?"); values.push(twitter_url); }
  if (currency !== undefined) { updates.push("currency = ?"); values.push(currency); }
  if (timezone !== undefined) { updates.push("timezone = ?"); values.push(timezone); }
  if (language !== undefined) { updates.push("language = ?"); values.push(language); }
  if (privacy_policy !== undefined) { updates.push("privacy_policy = ?"); values.push(privacy_policy); }
  if (terms_conditions !== undefined) { updates.push("terms_conditions = ?"); values.push(terms_conditions); }

  if (updates.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No hay campos para actualizar' });
  }

  values.push(1); // id = 1

  fsms_pool.query(
    `UPDATE dojo_settings SET ${updates.join(", ")} WHERE id = ?`,
    values,
    (err, result) => {
      
      if (err) {
        console.error('❌ Error updating dojo settings:', err);
        return res.status(500).json({ status: 'error', message: 'Update failed' });
      }

      if (result.affectedRows === 0) {
        console.log('❌ No rows affected');
        return res.status(404).json({ status: 'error', message: 'Dojo settings not found' });
      }

      // Obtener registro actualizado
      fsms_pool.query('SELECT * FROM dojo_settings WHERE id = 1', (selectErr, rows) => {
        if (selectErr) {
          console.error('❌ Error getting updated dojo settings:', selectErr);
          return res.status(500).json({ status: 'error', message: 'DB error' });
        }

        console.log('✅ Sending success response');
        res.json({ 
          status: 'success', 
          message: 'Configuración actualizada exitosamente',
          data: rows[0]
        });
      });
    }
  );
});

module.exports = router;