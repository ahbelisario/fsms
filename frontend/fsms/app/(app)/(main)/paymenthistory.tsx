import React, { useEffect, useState } from "react";
import { Redirect, type Href } from "expo-router";
import { Text, View } from "react-native";
import PaymentHistoryScreen from "@/src/screens/main/PaymentHistoryScreen";
import { getAuthToken } from "@/src/storage/authStorage";

export default function PaymentHistoryRoute() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const LOGIN: Href = "/(auth)";

  useEffect(() => {
    (async () => {
      try {
        const t = await getAuthToken();
        setHasToken(!!t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!hasToken) {
    return <Redirect href={LOGIN} />;
  }

  return <PaymentHistoryScreen />;
}
