const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail } = require('./config/email');

/**
 * POST /api/register
 * Registrar nuevo usuario
 */
router.post('/', async (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  
  const { name, lastname, username, email, password, language, privacy_accepted, privacy_version } = req.body;

  // Validaciones básicas
  if (!name || !lastname || !username || !email || !password) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Todos los campos son requeridos' 
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'La contraseña debe tener al menos 8 caracteres' 
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Email inválido' 
    });
  }

  // Verificar si username ya existe
  fsms_pool.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [username.trim()],
    (err, usernameRows) => {
      if (err) {
        console.error('Error checking username:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (usernameRows.length > 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'El nombre de usuario ya está en uso' 
        });
      }

      // Verificar si email ya existe
      fsms_pool.query(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email.trim().toLowerCase()],
        async (emailErr, emailRows) => {
          if (emailErr) {
            console.error('Error checking email:', emailErr);
            return res.status(500).json({ status: 'error', message: 'DB error' });
          }

          if (emailRows.length > 0) {
            return res.status(400).json({ 
              status: 'error', 
              message: 'El email ya está registrado' 
            });
          }

          try {
            // Hashear contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generar token de verificación
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            // Insertar usuario
            fsms_pool.query(
              `INSERT INTO users 
               (name, lastname, username, email, password, role, active, email_verified, verification_token, verification_token_expires, privacy_accepted, privacy_accepted_at, privacy_version) 
               VALUES (?, ?, ?, ?, ?, 'student', 0, 0, ?, ?, ?, ?, ?)`,
              [
                name.trim(),
                lastname.trim(),
                username.trim(),
                email.trim().toLowerCase(),
                hashedPassword,
                verificationToken,
                tokenExpires,
                privacy_accepted ? 1 : 0,
                privacy_accepted ? new Date() : null,
                privacy_accepted ? (privacy_version || '1.0') : null
              ],
              (insertErr, result) => {
                if (insertErr) {
                  console.error('Error inserting user:', insertErr);
                  return res.status(500).json({ status: 'error', message: 'Registration failed' });
                }

                const userId = result.insertId;

                // 1. Crear user_profiles
                fsms_pool.query(
                  `INSERT INTO user_profiles (user_id, name, lastname, email) VALUES (?, ?, ?, ?)`,
                  [userId, name.trim(), lastname.trim(), email.trim().toLowerCase()],
                  (profileErr) => {
                    if (profileErr) {
                      console.error('Error creating user_profiles:', profileErr);
                    }

                    // 2. Crear user_settings con idioma seleccionado
                    fsms_pool.query(
                      `INSERT INTO user_settings (user_id, language) VALUES (?, ?)`,
                      [userId, language || 'es'],
                      (settingsErr) => {
                        if (settingsErr) {
                          console.error('Error creating user_settings:', settingsErr);
                        }

                        // 3. Insertar token en tabla de verificación
                        fsms_pool.query(
                          `INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
                          [userId, verificationToken, tokenExpires],
                          (tokenErr) => {
                            if (tokenErr) {
                              console.error('Error inserting verification token:', tokenErr);
                            }

                            // 4. Enviar email de verificación
                            sendVerificationEmail(
                              email.trim().toLowerCase(),
                              `${name} ${lastname}`,
                              verificationToken,
                              fsms_pool,
                              language || 'es'
                            ).then((emailResult) => {
                              if (emailResult.success) {
                                res.json({ 
                                  status: 'success', 
                                  message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
                                  data: {
                                    id: userId,
                                    email: email.trim().toLowerCase(),
                                    name: name.trim(),
                                    lastname: lastname.trim()
                                  }
                                });
                              } else {
                                res.json({ 
                                  status: 'success', 
                                  message: 'Registro exitoso, pero hubo un error al enviar el email de verificación. Contacta al administrador.',
                                  emailSent: false
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
          } catch (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).json({ status: 'error', message: 'Registration failed' });
          }
        }
      );
    }
  );
});

/**
 * GET /api/register/verify-email?token=xxxxx
 * Verificar email del usuario
 */
router.get('/verify-email', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Token no proporcionado' 
    });
  }

  fsms_pool.query(
    `SELECT u.id, u.name, u.lastname, u.email 
     FROM users u
     WHERE u.verification_token = ? 
     AND u.verification_token_expires > NOW()
     AND u.email_verified = 0
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

      fsms_pool.query(
        `UPDATE users 
         SET email_verified = 1, active = 1, verification_token = NULL, verification_token_expires = NULL 
         WHERE id = ?`,
        [user.id],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating user:', updateErr);
            return res.status(500).json({ status: 'error', message: 'Verification failed' });
          }

          fsms_pool.query(
            'UPDATE email_verification_tokens SET used = 1 WHERE token = ?',
            [token],
            (tokenErr) => {
              if (tokenErr) console.error('Error updating token:', tokenErr);
            }
          );

          fsms_pool.query(
            'SELECT language FROM user_settings WHERE user_id = ? LIMIT 1',
            [user.id],
            (langErr, langRows) => {
              const userLanguage = langRows && langRows[0] ? langRows[0].language : 'es';
              
              sendWelcomeEmail(
                user.email, 
                `${user.name} ${user.lastname}`, 
                fsms_pool,
                userLanguage
              );

              res.json({ 
                status: 'success', 
                message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
                data: {
                  name: user.name,
                  lastname: user.lastname,
                  email: user.email
                }
              });
            }
          );
        }
      );
    }
  );
});

/**
 * POST /api/register/resend-verification
 * Reenviar email de verificación
 */
router.post('/resend-verification', (req, res) => {
  const fsms_pool = req.app.locals.fsms_pool;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Email requerido' 
    });
  }

  fsms_pool.query(
    `SELECT id, name, lastname, email, email_verified 
     FROM users 
     WHERE email = ? AND email_verified = 0 
     LIMIT 1`,
    [email.trim().toLowerCase()],
    (err, users) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ status: 'error', message: 'DB error' });
      }

      if (users.length === 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Email no encontrado o ya verificado' 
        });
      }

      const user = users[0];

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      fsms_pool.query(
        `UPDATE users 
         SET verification_token = ?, verification_token_expires = ? 
         WHERE id = ?`,
        [verificationToken, tokenExpires, user.id],
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

              sendVerificationEmail(
                user.email,
                `${user.name} ${user.lastname}`,
                verificationToken,
                fsms_pool,
                userLanguage
              ).then((emailResult) => {
                if (emailResult.success) {
                  res.json({ 
                    status: 'success', 
                    message: 'Email de verificación reenviado. Revisa tu bandeja de entrada.' 
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
});

module.exports = router;