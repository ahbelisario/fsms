const translations = {
  es: {
    verification: {
      subject: '✅ Verifica tu cuenta - {dojoName}',
      title: '¡Bienvenido a {dojoName}!',
      greeting: 'Hola <strong>{userName}</strong>,',
      body: 'Gracias por registrarte en nuestra plataforma. Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email haciendo click en el botón de abajo:',
      button: 'Verificar mi email',
      or_copy: 'O copia y pega este enlace en tu navegador:',
      expires: 'Este enlace expirará en 24 horas.',
      ignore: 'Si no creaste esta cuenta, puedes ignorar este email.',
      footer: 'Este es un email automático, por favor no respondas a este mensaje.',
      rights: '© {year} {dojoName}. Todos los derechos reservados.'
    },
    welcome: {
      subject: '🎉 ¡Tu cuenta ha sido activada! - {dojoName}',
      title: '🎉 ¡Cuenta Activada!',
      greeting: 'Hola <strong>{userName}</strong>,',
      body: '¡Tu cuenta ha sido verificada exitosamente!',
      cta: 'Ya puedes iniciar sesión y comenzar a usar todas las funcionalidades de {dojoName}.',
      button: 'Iniciar Sesión'
    },
    password_reset: {
      subject: '🔑 Recuperación de contraseña - {dojoName}',
      title: 'Recupera tu contraseña',
      greeting: 'Hola <strong>{userName}</strong>,',
      body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú quien lo solicitó, haz click en el botón de abajo para crear una nueva contraseña:',
      button: 'Restablecer contraseña',
      or_copy: 'O copia y pega este enlace en tu navegador:',
      expires: 'Este enlace expirará en 1 hora.',
      ignore: 'Si no solicitaste este cambio, puedes ignorar este email y tu contraseña seguirá siendo la misma.',
      security_tip: '<strong>Consejo de seguridad:</strong> Nunca compartas tu contraseña con nadie.',
      footer: 'Este es un email automático, por favor no respondas a este mensaje.',
      rights: '© {year} {dojoName}. Todos los derechos reservados.'
    },
    password_changed: {
      subject: '✅ Contraseña actualizada - {dojoName}',
      title: 'Contraseña Actualizada',
      greeting: 'Hola <strong>{userName}</strong>,',
      body: 'Tu contraseña ha sido cambiada exitosamente.',
      cta: 'Si realizaste este cambio, no necesitas hacer nada más. Si <strong>NO</strong> fuiste tú, contacta inmediatamente con el soporte.',
      security_alert: '⚠️ Si no reconoces esta actividad, tu cuenta podría estar comprometida.',
      button: 'Contactar Soporte',
      footer: 'Este es un email automático, por favor no respondas a este mensaje.',
      rights: '© {year} {dojoName}. Todos los derechos reservados.'
    }
  },
  en: {
    verification: {
      subject: '✅ Verify your account - {dojoName}',
      title: 'Welcome to {dojoName}!',
      greeting: 'Hello <strong>{userName}</strong>,',
      body: 'Thank you for signing up. To complete your registration and activate your account, please verify your email address by clicking the button below:',
      button: 'Verify my email',
      or_copy: 'Or copy and paste this link in your browser:',
      expires: 'This link will expire in 24 hours.',
      ignore: 'If you did not create this account, you can ignore this email.',
      footer: 'This is an automated email, please do not reply to this message.',
      rights: '© {year} {dojoName}. All rights reserved.'
    },
    welcome: {
      subject: '🎉 Your account has been activated! - {dojoName}',
      title: '🎉 Account Activated!',
      greeting: 'Hello <strong>{userName}</strong>,',
      body: 'Your account has been successfully verified!',
      cta: 'You can now log in and start using all the features of {dojoName}.',
      button: 'Log In'
    },
    password_reset: {
      subject: '🔑 Password Recovery - {dojoName}',
      title: 'Reset Your Password',
      greeting: 'Hello <strong>{userName}</strong>,',
      body: 'We received a request to reset your account password. If you made this request, click the button below to create a new password:',
      button: 'Reset Password',
      or_copy: 'Or copy and paste this link in your browser:',
      expires: 'This link will expire in 1 hour.',
      ignore: 'If you did not request this change, you can ignore this email and your password will remain the same.',
      security_tip: '<strong>Security tip:</strong> Never share your password with anyone.',
      footer: 'This is an automated email, please do not reply to this message.',
      rights: '© {year} {dojoName}. All rights reserved.'
    },
    password_changed: {
      subject: '✅ Password Updated - {dojoName}',
      title: 'Password Updated',
      greeting: 'Hello <strong>{userName}</strong>,',
      body: 'Your password has been changed successfully.',
      cta: 'If you made this change, you don\'t need to do anything else. If you <strong>DID NOT</strong> make this change, contact support immediately.',
      security_alert: '⚠️ If you don\'t recognize this activity, your account may be compromised.',
      button: 'Contact Support',
      footer: 'This is an automated email, please do not reply to this message.',
      rights: '© {year} {dojoName}. All rights reserved.'
    }
  }
};

/**
 * Obtener traducción con reemplazo de variables
 */
function t(lang, key, vars = {}) {
  const keys = key.split('.');
  let value = translations[lang] || translations['es'];
  
  for (const k of keys) {
    value = value[k];
    if (!value) return key; // Fallback si no existe la clave
  }
  
  // Reemplazar variables {var}
  return value.replace(/\{(\w+)\}/g, (match, varName) => {
    return vars[varName] !== undefined ? vars[varName] : match;
  });
}

module.exports = { t };