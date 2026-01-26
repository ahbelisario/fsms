import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { getAuthToken, isSessionExpired } from "@/src/storage/authStorage";

export default function AuthLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();

      if (token && !isSessionExpired(token)) {
        router.replace("/(app)/home"); // ajusta tu ruta default
        return;
      }

      setReady(true);
    })();
  }, [router]);

  if (!ready) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}