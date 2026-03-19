const nodemailer = require('nodemailer');
const { t } = require('./i18n-email');

// Configuración del transporter con Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@budodesk.com',     
    pass: 'Bud0Desk123#$',
  },
});

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error);
  } else {
    console.log('✅ SMTP server ready to send emails');
  }
});

/**
 * Obtener nombre del dojo desde la BD
 */
function getDojoName(pool, callback) {
  pool.query(
    'SELECT dojo_name FROM dojo_settings WHERE id = 1 LIMIT 1',
    (err, rows) => {
      if (err || !rows || rows.length === 0) {
        callback('BudoDesk');
      } else {
        callback(rows[0].dojo_name || 'BudoDesk');
      }
    }
  );
}

/**
 * Obtener URL del frontend
 */
function getFrontendUrl(pool, callback) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    callback('http://localhost:8081');
  } else {
    pool.query(
      'SELECT short_name FROM dojo_settings WHERE id = 1 LIMIT 1',
      (err, rows) => {
        if (err || !rows || rows.length === 0) {
          callback('https://budodesk.com');
        } else {
          const shortName = rows[0].short_name || 'app';
          callback(`https://${shortName}.budodesk.com`);
        }
      }
    );
  }
}

/**
 * Enviar email de verificación (multiidioma)
 * @param {string} to - Email destino
 * @param {string} userName - Nombre del usuario
 * @param {string} verificationToken - Token de verificación
 * @param {object} pool - Pool de conexión MySQL
 * @param {string} language - Idioma ('es' o 'en')
 */
async function sendVerificationEmail(to, userName, verificationToken, pool, language = 'es') {
  return new Promise((resolve) => {
    getFrontendUrl(pool, (frontendUrl) => {
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
      getDojoName(pool, (dojoName) => {
        const year = new Date().getFullYear();
        const lang = language || 'es';
        
        const vars = { dojoName, userName, verificationUrl, year };
        
        const mailOptions = {
          from: `"${dojoName}" <no-reply@budodesk.com>`, 
          to: to,
          subject: t(lang, 'verification.subject', vars),
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${t(lang, 'verification.title', vars)}</h1>
                </div>
                <div class="content">
                  <p>${t(lang, 'verification.greeting', vars)}</p>
                  <p>${t(lang, 'verification.body', vars)}</p>
                  <p style="text-align: center;">
                    <a href="${verificationUrl}" class="button">${t(lang, 'verification.button', vars)}</a>
                  </p>
                  <p>${t(lang, 'verification.or_copy', vars)}</p>
                  <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
                  <p><strong>${t(lang, 'verification.expires', vars)}</strong></p>
                  <p>${t(lang, 'verification.ignore', vars)}</p>
                </div>
                <div class="footer">
                  <p>${t(lang, 'verification.footer', vars)}</p>
                  <p>${t(lang, 'verification.rights', vars)}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        transporter.sendMail(mailOptions)
          .then((info) => {
            console.log(`✅ Verification email sent (${lang}):`, info.messageId);
            resolve({ success: true, messageId: info.messageId });
          })
          .catch((error) => {
            console.error('❌ Error sending verification email:', error);
            resolve({ success: false, error: error.message });
          });
      });
    });
  });
}

/**
 * Enviar email de bienvenida (multiidioma)
 * @param {string} to - Email destino
 * @param {string} userName - Nombre del usuario
 * @param {object} pool - Pool de conexión MySQL
 * @param {string} language - Idioma ('es' o 'en')
 */
async function sendWelcomeEmail(to, userName, pool, language = 'es') {
  return new Promise((resolve) => {
    getFrontendUrl(pool, (frontendUrl) => {
      getDojoName(pool, (dojoName) => {
        const year = new Date().getFullYear();
        const lang = language || 'es';
        const vars = { dojoName, userName, frontendUrl, year };
        
        const mailOptions = {
          from: `"${dojoName}" <no-reply@budodesk.com>`, 
          to: to,
          subject: t(lang, 'welcome.subject', vars),
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${t(lang, 'welcome.title', vars)}</h1>
                </div>
                <div class="content">
                  <p>${t(lang, 'welcome.greeting', vars)}</p>
                  <p>${t(lang, 'welcome.body', vars)}</p>
                  <p>${t(lang, 'welcome.cta', vars)}</p>
                  <p style="text-align: center;">
                    <a href="${frontendUrl}" class="button">${t(lang, 'welcome.button', vars)}</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        transporter.sendMail(mailOptions)
          .then(() => {
            console.log(`✅ Welcome email sent (${lang}) to:`, to);
            resolve({ success: true });
          })
          .catch((error) => {
            console.error('❌ Error sending welcome email:', error);
            resolve({ success: false, error: error.message });
          });
      });
    });
  });
}

/**
 * Enviar email de recuperación de contraseña (multiidioma)
 * @param {string} to - Email destino
 * @param {string} userName - Nombre del usuario
 * @param {string} resetToken - Token de recuperación
 * @param {object} pool - Pool de conexión MySQL
 * @param {string} language - Idioma ('es' o 'en')
 */
async function sendPasswordResetEmail(to, userName, resetToken, pool, language = 'es') {
  return new Promise((resolve) => {
    getFrontendUrl(pool, (frontendUrl) => {
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      getDojoName(pool, (dojoName) => {
        const year = new Date().getFullYear();
        const lang = language || 'es';
        
        const vars = { dojoName, userName, resetUrl, year };
        
        const mailOptions = {
          from: `"${dojoName}" <no-reply@budodesk.com>`, 
          to: to,
          subject: t(lang, 'password_reset.subject', vars),
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
                .security-tip { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${t(lang, 'password_reset.title', vars)}</h1>
                </div>
                <div class="content">
                  <p>${t(lang, 'password_reset.greeting', vars)}</p>
                  <p>${t(lang, 'password_reset.body', vars)}</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">${t(lang, 'password_reset.button', vars)}</a>
                  </p>
                  <p>${t(lang, 'password_reset.or_copy', vars)}</p>
                  <p style="word-break: break-all; color: #f59e0b;">${resetUrl}</p>
                  <p><strong>${t(lang, 'password_reset.expires', vars)}</strong></p>
                  <p>${t(lang, 'password_reset.ignore', vars)}</p>
                  <div class="security-tip">
                    ${t(lang, 'password_reset.security_tip', vars)}
                  </div>
                </div>
                <div class="footer">
                  <p>${t(lang, 'password_reset.footer', vars)}</p>
                  <p>${t(lang, 'password_reset.rights', vars)}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        transporter.sendMail(mailOptions)
          .then((info) => {
            console.log(`✅ Password reset email sent (${lang}):`, info.messageId);
            resolve({ success: true, messageId: info.messageId });
          })
          .catch((error) => {
            console.error('❌ Error sending password reset email:', error);
            resolve({ success: false, error: error.message });
          });
      });
    });
  });
}

/**
 * Enviar email de confirmación de cambio de contraseña (multiidioma)
 * @param {string} to - Email destino
 * @param {string} userName - Nombre del usuario
 * @param {object} pool - Pool de conexión MySQL
 * @param {string} language - Idioma ('es' o 'en')
 */
async function sendPasswordChangedEmail(to, userName, pool, language = 'es') {
  return new Promise((resolve) => {
    getFrontendUrl(pool, (frontendUrl) => {
      getDojoName(pool, (dojoName) => {
        const year = new Date().getFullYear();
        const lang = language || 'es';
        const vars = { dojoName, userName, frontendUrl, year };
        
        const mailOptions = {
          from: `"${dojoName}" <no-reply@budodesk.com>`, 
          to: to,
          subject: t(lang, 'password_changed.subject', vars),
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${t(lang, 'password_changed.title', vars)}</h1>
                </div>
                <div class="content">
                  <p>${t(lang, 'password_changed.greeting', vars)}</p>
                  <p>${t(lang, 'password_changed.body', vars)}</p>
                  <p>${t(lang, 'password_changed.cta', vars)}</p>
                  <div class="alert">
                    ${t(lang, 'password_changed.security_alert', vars)}
                  </div>
                  <p style="text-align: center;">
                    <a href="${frontendUrl}/support" class="button">${t(lang, 'password_changed.button', vars)}</a>
                  </p>
                </div>
                <div class="footer" style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
                  <p>${t(lang, 'password_changed.footer', vars)}</p>
                  <p>${t(lang, 'password_changed.rights', vars)}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        transporter.sendMail(mailOptions)
          .then(() => {
            console.log(`✅ Password changed email sent (${lang}) to:`, to);
            resolve({ success: true });
          })
          .catch((error) => {
            console.error('❌ Error sending password changed email:', error);
            resolve({ success: false, error: error.message });
          });
      });
    });
  });
}

module.exports = {
  transporter,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};