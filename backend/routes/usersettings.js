const express = require('express');
const router = express.Router();

// GET - preferencia de lenguaje
router.get('/:id', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query('SELECT * FROM user_settings WHERE id = ?', 
    [id],
    (err, rows) => {
       if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
       if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
       res.json({ status: 'success', data: rows[0] });
      });
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
    'UPDATE user_settings SET language = ? WHERE id = ?',
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
