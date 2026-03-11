import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { appStyles } from "@/src/styles/appStyles";
import { API_BASE_URL } from "@/src/config/api.config";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setLoading(false);
      setError("Token de verificación no proporcionado");
    }
  }, [token]);

  async function verifyEmail() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/register/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setUserName(data.data?.name || "");
      } else {
        setError(data.message || "Error al verificar email");
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[appStyles.page, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: "#64748b" }}>Verificando tu email...</Text>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[appStyles.page, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <View style={appStyles.card}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 64 }}>✅</Text>
          </View>
          
          <Text style={[appStyles.title, { textAlign: "center" }]}>
            ¡Email Verificado!
          </Text>
          
          <Text style={[appStyles.subtitle, { textAlign: "center", marginBottom: 20 }]}>
            {userName && `¡Bienvenido ${userName}! `}
            Tu cuenta ha sido activada exitosamente.
          </Text>

          <Text style={{ textAlign: "center", color: "#64748b", marginBottom: 24 }}>
            Ya puedes iniciar sesión y comenzar a usar la plataforma.
          </Text>

          <Pressable
            style={appStyles.submitBtn}
            onPress={() => router.replace("/(auth)")}
          >
            <Text style={appStyles.submitBtnText}>Ir a Iniciar Sesión</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[appStyles.page, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
      <View style={appStyles.card}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 64 }}>❌</Text>
        </View>
        
        <Text style={[appStyles.title, { textAlign: "center", color: "#dc2626" }]}>
          Error de Verificación
        </Text>
        
        <Text style={{ textAlign: "center", color: "#64748b", marginVertical: 16 }}>
          {error}
        </Text>

        <Text style={{ textAlign: "center", color: "#64748b", fontSize: 12, marginBottom: 24 }}>
          El enlace puede haber expirado o ya fue usado. Si necesitas ayuda, contacta al administrador.
        </Text>

        <Pressable
          style={appStyles.submitBtn}
          onPress={() => router.replace("/(auth)")}
        >
          <Text style={appStyles.submitBtnText}>Volver a Login</Text>
        </Pressable>
      </View>
    </View>
  );
}