import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { getAuthToken, isSessionExpired } from "@/src/storage/authStorage";
import Footer from "@/src/components/footer";

export default function AuthLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();

      if (token && !isSessionExpired(token)) {
        router.replace("/(app)/(main)/home"); // ajusta tu ruta default
        return;
      }

      setReady(true);
    })();
  }, [router]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Stack de pantallas de autenticación */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      
      {/* ✅ Footer global */}
      <Footer />
    </View>
  );
}