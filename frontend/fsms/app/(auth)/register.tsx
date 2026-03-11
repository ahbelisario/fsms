import React, { useEffect, useState } from "react";
import { Redirect, type Href } from "expo-router";
import { Text, View } from "react-native";
import RegisterScreen from "@/src/screens/auth/RegisterScreen";
import { getAuthToken } from "@/src/storage/authStorage";

export default function RegisterRoute() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const APP_HOME: Href = "/(app)"; // ← Cambiar a la ruta de tu app

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

  // Si YA está autenticado, redirigir al app (no tiene sentido que se registre de nuevo)
  if (hasToken) {
    return <Redirect href={APP_HOME} />;
  }

  // Si NO está autenticado, mostrar pantalla de registro
  return <RegisterScreen />;
}