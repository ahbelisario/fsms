const express = require('express');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

// GET - preferencia de lenguaje
router.get('/:id', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query('SELECT * FROM user_settings WHERE user_id = ?', 
    [id],
    (err, rows) => {
       if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
       if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
       res.json({ status: 'success', data: rows[0] });
      });
});

/**
 * POST /api/usersettings
 */
router.post('/', requireAdmin, async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { user_id, language } = req.body;

  if (!user_id || !language ) {
    return res.status(400).json({ status: 'error', message: 'User Id and Language are required' });
  }

  try {
    const sql = 'INSERT INTO user_settings (user_id, language) VALUES (?,?)';
    fsms_pool.query(sql, [user_id, language], (err, result) => {
      if (err) {
        // Si username es UNIQUE, aquí puedes mapear el error a 409
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Insert failed' });
      }

      res.status(201).json({
        status: 'success',
        data: { user_id, language }
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Hash failed' });
  }
});


// PUT - actualizar
router.put('/:id/language', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;
  const { lang } = req.body;

  if (!lang) {
    return res.status(400).json({ status: 'error', message: 'Language is required' });
  }

  fsms_pool.query(
    'UPDATE user_settings SET language = ? WHERE user_id = ?',
    [lang, id],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
      }
      res.json({ status: 'success', message: 'Updated' });
    }
  );
});

module.exports = router;
