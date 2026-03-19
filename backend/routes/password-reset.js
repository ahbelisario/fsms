// =====================================================
// Password Reset Routes
// Ubicación: backend/routes/password-reset.js
// =====================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('./config/email');

/**
 * POST /api/password-reset/request
 * Solicitar recuperación de contraseña
 * Body: { email }
 */
router.post('/request', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Email es requerido' 
    });
  }

  // Buscar usuario por email
  fsms_pool.query(
    `SELECT id, name, lastname, email, active, email_verified 
     FROM users 
     WHERE email = ? AND deleted = 0 
     LIMIT 1`,
    [email.trim().toLowerCase()],
    (err, users) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      // IMPORTANTE: Por seguridad, siempre respondemos OK aunque el email no exista
      // Esto evita que atacantes sepan qué emails están registrados
      if (users.length === 0) {
        return res.json({ 
          status: 'success', 
          message: 'Si el email existe, recibirás un enlace de recuperación.' 
        });
      }

      const user = users[0];

      // Validar que el usuario esté activo
      if (user.active === 0) {
        return res.json({ 
          status: 'success', 
          message: 'Si el email existe, recibirás un enlace de recuperación.' 
        });
      }

      // Generar token de recuperación (aleatorio, seguro)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Actualizar token en users
      fsms_pool.query(
        `UPDATE users 
         SET reset_token = ?, reset_token_expires = ? 
         WHERE id = ?`,
        [resetToken, tokenExpires, user.id],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating reset token:', updateErr);
            return res.status(500).json({ status: 'error', message: 'Failed to generate token' });
          }

          // Insertar en password_reset_tokens
          fsms_pool.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
             VALUES (?, ?, ?)`,
            [user.id, resetToken, tokenExpires],
            (tokenErr) => {
              if (tokenErr) {
                console.error('Error inserting reset token:', tokenErr);
                // No fallar si esto falla
              }

              // Obtener idioma del usuario
              fsms_pool.query(
                'SELECT language FROM user_settings WHERE user_id = ? LIMIT 1',
                [user.id],
                (langErr, langRows) => {
                  const userLanguage = langRows && langRows[0] ? langRows[0].language : 'es';

                  // Enviar email de recuperación
                  sendPasswordResetEmail(
                    user.email,
                    `${user.name} ${user.lastname}`,
                    resetToken,
                    fsms_pool,
                    userLanguage
                  ).then((emailResult) => {
                    if (emailResult.success) {
                      res.json({ 
                        status: 'success', 
                        message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.' 
                      });
                    } else {
                      res.status(500).json({ 
                        status: 'error', 
                        message: 'Error al enviar email. Inténtalo más tarde.' 
                      });
                    }
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

/**
 * POST /api/password-reset/verify
 * Verificar si el token es válido
 * Body: { token }
 */
router.post('/verify', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Token no proporcionado' 
    });
  }

  // Buscar token válido
  fsms_pool.query(
    `SELECT u.id, u.name, u.lastname, u.email 
     FROM users u
     WHERE u.reset_token = ? 
     AND u.reset_token_expires > NOW()
     AND u.active = 1
     AND u.deleted = 0
     LIMIT 1`,
    [token],
    (err, users) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (users.length === 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token inválido o expirado' 
        });
      }

      const user = users[0];

      res.json({ 
        status: 'success', 
        message: 'Token válido',
        data: {
          name: user.name,
          lastname: user.lastname,
          email: user.email
        }
      });
    }
  );
});

/**
 * POST /api/password-reset/reset
 * Restablecer contraseña con el token
 * Body: { token, newPassword }
 */
router.post('/reset', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Token y nueva contraseña son requeridos' 
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'La contraseña debe tener al menos 8 caracteres' 
    });
  }

  // Buscar token válido
  fsms_pool.query(
    `SELECT u.id, u.name, u.lastname, u.email 
     FROM users u
     WHERE u.reset_token = ? 
     AND u.reset_token_expires > NOW()
     AND u.active = 1
     AND u.deleted = 0
     LIMIT 1`,
    [token],
    async (err, users) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (users.length === 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token inválido o expirado' 
        });
      }

      const user = users[0];

      try {
        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña y limpiar token
        fsms_pool.query(
          `UPDATE users 
           SET password = ?, reset_token = NULL, reset_token_expires = NULL 
           WHERE id = ?`,
          [hashedPassword, user.id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating password:', updateErr);
              return res.status(500).json({ status: 'error', message: 'Password reset failed' });
            }

            // Marcar token como usado
            fsms_pool.query(
              'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
              [token],
              (tokenErr) => {
                if (tokenErr) console.error('Error updating token:', tokenErr);
              }
            );

            // Obtener idioma del usuario
            fsms_pool.query(
              'SELECT language FROM user_settings WHERE user_id = ? LIMIT 1',
              [user.id],
              (langErr, langRows) => {
                const userLanguage = langRows && langRows[0] ? langRows[0].language : 'es';

                // Enviar email de confirmación
                sendPasswordChangedEmail(
                  user.email,
                  `${user.name} ${user.lastname}`,
                  fsms_pool,
                  userLanguage
                );

                res.json({ 
                  status: 'success', 
                  message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' 
                });
              }
            );
          }
        );
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ status: 'error', message: 'Password reset failed' });
      }
    }
  );
});

/**
 * POST /api/password-reset/resend
 * Reenviar email de recuperación
 * Body: { email }
 */
router.post('/resend', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Email requerido' 
    });
  }

  // Buscar usuario
  fsms_pool.query(
    `SELECT id, name, lastname, email, reset_token, reset_token_expires 
     FROM users 
     WHERE email = ? AND active = 1 AND deleted = 0 
     LIMIT 1`,
    [email.trim().toLowerCase()],
    (err, users) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      // Por seguridad, siempre respondemos OK
      if (users.length === 0) {
        return res.json({ 
          status: 'success', 
          message: 'Si el email existe, recibirás un enlace de recuperación.' 
        });
      }

      const user = users[0];

      // Verificar si ya tiene un token válido
      if (user.reset_token && user.reset_token_expires > new Date()) {
        // Token aún válido, usar el mismo
        fsms_pool.query(
          'SELECT language FROM user_settings WHERE user_id = ? LIMIT 1',
          [user.id],
          (langErr, langRows) => {
            const userLanguage = langRows && langRows[0] ? langRows[0].language : 'es';

            sendPasswordResetEmail(
              user.email,
              `${user.name} ${user.lastname}`,
              user.reset_token,
              fsms_pool,
              userLanguage
            ).then(() => {
              res.json({ 
                status: 'success', 
                message: 'Email de recuperación reenviado.' 
              });
            });
          }
        );
      } else {
        // Generar nuevo token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        fsms_pool.query(
          `UPDATE users 
           SET reset_token = ?, reset_token_expires = ? 
           WHERE id = ?`,
          [resetToken, tokenExpires, user.id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating token:', updateErr);
              return res.status(500).json({ status: 'error', message: 'Update failed' });
            }

            fsms_pool.query(
              'SELECT language FROM user_settings WHERE user_id = ? LIMIT 1',
              [user.id],
              (langErr, langRows) => {
                const userLanguage = langRows && langRows[0] ? langRows[0].language : 'es';

                sendPasswordResetEmail(
                  user.email,
                  `${user.name} ${user.lastname}`,
                  resetToken,
                  fsms_pool,
                  userLanguage
                ).then((emailResult) => {
                  if (emailResult.success) {
                    res.json({ 
                      status: 'success', 
                      message: 'Email de recuperación reenviado.' 
                    });
                  } else {
                    res.status(500).json({ 
                      status: 'error', 
                      message: 'Error al enviar email.' 
                    });
                  }
                });
              }
            );
          }
        );
      }
    }
  );
});

module.exports = router;