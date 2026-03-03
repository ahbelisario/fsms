import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { en } from "./en";
import { es } from "./es";

const translations = {
  es,
  en
}

export const i18n = new I18n(translations);

// Locale inicial (ej: "es-MX" => "es")
const deviceLocale = Localization.getLocales()?.[0]?.languageCode ?? "es";
i18n.locale = deviceLocale;
i18n.enableFallback = true;

// Helper corto
export function t(key: string, options?: Record<string, any>) {
  return i18n.t(key, options);
}
