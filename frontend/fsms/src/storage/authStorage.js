import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "auth_token";

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(KEY);
  }
  return await SecureStore.getItemAsync(KEY);
}

export async function deleteAuthToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
