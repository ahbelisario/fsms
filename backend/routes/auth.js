const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * Recomendación: define JWT_SECRET en variables de entorno.
 * Ej: export JWT_SECRET="supersecret"
 */
const EXPIRATION_MINUTES = 30;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = EXPIRATION_MINUTES.toString() + 'm';

function base64Decode(value) {
  return Buffer.from(value, 'base64').toString('utf8');
}

// Middleware: validar JWT
function requireAuth(req, res, next) {
  const fsms_pool = req.app.locals.fsms_pool;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Verificar blacklist
    const sql = 'SELECT 1 FROM revoked_tokens WHERE token = ? LIMIT 1';
    fsms_pool.query(sql, [token], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Auth check failed' });
      }

      if (rows.length > 0) {
        return res.status(401).json({ status: 'error', message: 'Token revoked' });
      }

      req.user = payload;
      next();
    });
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

/**
 * POST /api/auth/login
 * Body: { username, password }  (si te llega en base64, decodifica antes de comparar)
 */
router.post('/login', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;

  const username = base64Decode(req.body.username);
  const password = base64Decode(req.body.password);

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'username and password are required' });
  }

  const sql = `
    SELECT id, username, password, name, lastname, email, role, active
    FROM users
    WHERE username = ?
    LIMIT 1
  `;

  fsms_pool.query(sql, [username], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'DB error' });
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.active === 0) {
      return res.status(403).json({ status: 'error', message: 'User is disabled' });
    }

    try {
      
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username, 
          name: user.name, 
          lastname: user.lastname,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
      );

      const currentDate = new Date(); // Original date
      const futureDate = new Date(currentDate.getTime() + EXPIRATION_MINUTES * 60 * 1000); // New date + EXPIRATION_MINUTES

      return res.status(200).json({
        status: 'success',
        data: {
          "token": { "token": token, "expiresin": JWT_EXPIRES_IN },
          user: { username: user.username, name: user.name, lastname: user.lastname, role: user.role }
        }
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ status: 'error', message: 'Auth failed' });
    }
  });
});

/**
 * POST /api/auth/logout
 * Con JWT puro, el logout real es del lado del cliente (borrar token).
 * Este endpoint existe para consistencia. Devuelve 200 siempre.
 */
router.post('/logout', requireAuth, (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(400).json({ status: 'error', message: 'No token provided' });
  }

  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  const sql = 'INSERT INTO revoked_tokens (token, expires_at) VALUES (?, ?)';
  fsms_pool.query(sql, [token, expiresAt], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'Logout failed' });
    }

    return res.status(200).json({ status: 'success', message: 'Logged out' });
  });
});

/**
 * GET /api/auth/me
 * Devuelve el usuario basado en el token
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      lastname: req.user.lastname,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = { router, requireAuth };

