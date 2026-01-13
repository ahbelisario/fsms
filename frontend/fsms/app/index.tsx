import React, { useEffect, useState } from "react";
import { Stack, usePathname, useRouter, Redirect, type Href } from "expo-router";
import { Text, View } from "react-native";
import LoginScreen from "@/src/screens/LoginScreen";
import { getAuthToken, setAuthToken } from "@/src/storage/authStorage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const USERS: Href = "/users";

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
    await setAuthToken(token);
    setToken(token);
    router.replace("/users" as const);
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
    return <Redirect href={USERS} />;
  }

  return <LoginScreen onLoginSuccess={onLoginSuccess} />;
}
