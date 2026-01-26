import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "app_locale";

export async function setAppLocale(locale: "es" | "en") {
  if (Platform.OS === "web") {
    localStorage.setItem(KEY, locale);
    return;
  }
  await SecureStore.setItemAsync(KEY, locale);
}

export async function getAppLocale(): Promise<"es" | "en" | null> {
  const v =
    Platform.OS === "web"
      ? localStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
  return (v === "es" || v === "en") ? v : null;
}