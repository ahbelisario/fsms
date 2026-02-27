// src/config/api.config.js

/**
 * Configuración de la URL base de la API
 * - En desarrollo: usa localhost
 * - En producción: usa rutas relativas (nginx como proxy)
 */
export const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : '';

// Exporta también la función si necesitas lógica adicional
export const getApiBaseUrl = () => API_BASE_URL;