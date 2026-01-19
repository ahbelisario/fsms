import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const EXPIRES_KEY = "auth_expires_at";
const SESSION_MINUTES = 30;

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

  if (!raw) return false;

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
