import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import LoginScreen from "@/src/screens/LoginScreen";
import { getAuthToken, setAuthSession, isSessionExpired, clearAuthSession, } from "@/src/storage/authStorage";
import { api } from "@/src/api/client";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const expired = await isSessionExpired();
        if (expired) {
          await clearAuthSession();
          return;
        }

        const meResp = await api.me();
        const me = meResp?.data ?? meResp;

        const role = String(me?.role ?? "").trim().toLowerCase();
        setRedirectTo(role === "admin" ? "/(app)/dashboard" : "/(app)/home");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onLoginSuccess({ token, role }: { token: string; role: string }) {
    await setAuthSession(token);

    const r = String(role ?? "").trim().toLowerCase();
    setRedirectTo(r === "admin" ? "/(app)/dashboard" : "/(app)/home");
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }


  if (redirectTo) {
    return <Redirect href={redirectTo as any} />;
  }

  return <LoginScreen onLoginSuccess={onLoginSuccess} />;
}
