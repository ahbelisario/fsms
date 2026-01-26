import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { i18n } from "./index";

const KEY = "app_lang";

export async function setLang(lang: "es" | "en") {
  i18n.locale = lang;

  if (Platform.OS === "web") {
    localStorage.setItem(KEY, lang);
  } else {
    await SecureStore.setItemAsync(KEY, lang);
  }
}

export async function loadLang(): Promise<"es" | "en"> {
  const saved =
    Platform.OS === "web"
      ? localStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);

  const lang = saved === "en" ? "en" : "es";
  i18n.locale = lang;
  return lang;
}
