// =====================================================
// i18n para Backend - Email Templates
// Ubicación: backend/config/i18n-email.js
// =====================================================

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