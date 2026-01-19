import React, { useEffect, useState } from "react";
import { Redirect, useRouter, type Href } from "expo-router";
import { Text, View } from "react-native";
import LoginScreen from "@/src/screens/LoginScreen";
import { getAuthToken, setAuthSession, isSessionExpired, clearAuthSession } from "@/src/storage/authStorage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const DASHBOARD: Href = "/dashboard";
  const HOME: Href = "/home";

  useEffect(() => {
    (async () => {
      try {
        const t = await getAuthToken();
        if (!t) {
          setToken(null);
          return;
        }

        const expired = await isSessionExpired();
        if (expired) {
          await clearAuthSession();
          setToken(null);
          return;
        }

        setToken(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLoginSuccess({ token, role }: { token: string; role: string;}) {
    await setAuthSession(token);
    setToken(token);

    console.log(role);
    if (role === "admin") {
      router.replace(DASHBOARD);
    } else {
      router.replace(HOME);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (token) {
    return <Redirect href={DASHBOARD} />;
  }

  return <LoginScreen onLoginSuccess={onLoginSuccess} />;
}
