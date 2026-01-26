const express = require('express');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  next();
}

// GET - listar todas
router.get('/', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  try {
    const [records, count] = await Promise.all([
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT * FROM disciplines', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        fsms_pool.query('SELECT COUNT(*) AS total_rows FROM disciplines', (err, rows) => {
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

// GET - obtener por id
router.get('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'SELECT * FROM disciplines WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'DB error' });
      if (result.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
      }
      res.json({ status: 'success', data: result[0] });
    }
  );
});

// POST - crear
router.post('/', requireAdmin, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Name is required' });
  }

  fsms_pool.query(
    'INSERT INTO disciplines (name, description) VALUES (?, ?)',
    [name, description ?? null],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Insert failed' });

      res.status(201).json({
        status: 'success',
        data: { id: result.insertId, name, description: description ?? null }
      });
    }
  );
});

// PUT - actualizar
router.put('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Name is required' });
  }

  fsms_pool.query(
    'UPDATE disciplines SET name = ?, description = ? WHERE id = ?',
    [name, description ?? null, id],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
      }
      res.json({ status: 'success', message: 'Updated' });
    }
  );
});

// DELETE - eliminar

router.delete('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'DELETE FROM disciplines WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Delete failed' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
      }
      res.json({ status: 'success', message: 'Deleted' });
    }
  );
});

module.exports = router;
