import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const EXPIRES_KEY = "auth_expires_at";
const SESSION_MINUTES = 60; // 8 horas (8 * 60 = 480 minutos)

export async function setAuthSession(token) {
  const expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000;

  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, String(expiresAt));
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(EXPIRES_KEY, String(expiresAt));
}

export async function getAuthToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function isSessionExpired() {
  const token = await getAuthToken();
  if (!token) return true;

  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(EXPIRES_KEY)
      : await SecureStore.getItemAsync(EXPIRES_KEY);

  // Si no hay fecha de expiración, asumir expirado por seguridad
  if (!raw) return true;

  return Date.now() > Number(raw);
}

export async function clearAuthSession() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRES_KEY);
}

/**
 * Extiende la sesión actual otros SESSION_MINUTES desde ahora.
 * Llama esto en cada petición exitosa al backend para mantener
 * la sesión activa mientras el usuario está usando la app.
 * 
 * @returns {Promise<boolean>} true si se extendió, false si no hay token
 */
export async function extendSession() {
  const token = await getAuthToken();
  if (!token) return false;
  
  const expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000;
  
  if (Platform.OS === "web") {
    localStorage.setItem(EXPIRES_KEY, String(expiresAt));
  } else {
    await SecureStore.setItemAsync(EXPIRES_KEY, String(expiresAt));
  }
  
  return true;
}

/**
 * Obtiene el tiempo restante de la sesión en minutos.
 * Útil para mostrar al usuario cuánto tiempo le queda.
 * 
 * @returns {Promise<number>} minutos restantes, o 0 si expiró
 */
export async function getSessionTimeRemaining() {
  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(EXPIRES_KEY)
      : await SecureStore.getItemAsync(EXPIRES_KEY);

  if (!raw) return 0;

  const expiresAt = Number(raw);
  const remaining = expiresAt - Date.now();
  
  if (remaining <= 0) return 0;
  
  return Math.floor(remaining / (60 * 1000)); // Convertir a minutos
}

export async function ensureSessionExpiry() {
  const token = await getAuthToken();
  if (!token) return;

  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(EXPIRES_KEY)
      : await SecureStore.getItemAsync(EXPIRES_KEY);

  if (!raw) {
    const expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000;
    if (Platform.OS === "web") localStorage.setItem(EXPIRES_KEY, String(expiresAt));
    else await SecureStore.setItemAsync(EXPIRES_KEY, String(expiresAt));
  }
}