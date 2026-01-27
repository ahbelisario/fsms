import { Stack } from "expo-router";
import { LanguageProvider } from "@/src/i18n/LanguageProvider";
import "./global.css";

import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Ionicons.font);

  // Si no quieres “pantalla en blanco”, puedes regresar el Stack igual,
  // pero para que el header no renderice antes de fonts, mantenlo así:
  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LanguageProvider>
  );
}
