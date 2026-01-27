import { Stack } from "expo-router";
import { LanguageProvider } from "@/src/i18n/LanguageProvider";
import "./global.css";

import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LanguageProvider>
  );
}
