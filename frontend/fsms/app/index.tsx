import React, { useEffect, useState } from "react";
import { Stack, usePathname, useRouter, Redirect, type Href } from "expo-router";
import { Text, View } from "react-native";
import LoginScreen from "@/src/screens/LoginScreen";
import { getAuthToken, setAuthSession } from "@/src/storage/authStorage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const DASHBOARD: Href = "/dashboard";

  useEffect(() => {
    (async () => {
      try {
        const t = await getAuthToken();
        setToken(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLoginSuccess({ token }: { token: string }) {
    await setAuthSession(token);
    setToken(token);
    router.replace("/dashboard" as const);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // Si ya hay token, manda a /users
  if (token) {
    return <Redirect href={DASHBOARD} />;
  }

  return <LoginScreen onLoginSuccess={onLoginSuccess} />;
}
