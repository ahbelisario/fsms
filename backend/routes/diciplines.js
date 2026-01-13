const express = require('express');
const router = express.Router();

// GET - listar todas
router.get('/', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  fsms_pool.query('SELECT * FROM diciplines', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }
    res.json({ status: 'success', data: result });
  });
});

// GET - obtener por id
router.get('/:id', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { id } = req.params;

  fsms_pool.query(
    'SELECT * FROM diciplines WHERE id = ?',
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
router.post('/', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Name is required' });
  }

  fsms_pool.query(
    'INSERT INTO diciplines (name, description) VALUES (?, ?)',
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
    'UPDATE diciplines SET name = ?, description = ? WHERE id = ?',
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
    'DELETE FROM diciplines WHERE id = ?',
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
