import React, { useMemo, useState } from "react";
import { Alert, ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { encode as b64encode } from "base-64";
import { notify } from "../ui/notify";
import { appStyles } from '../styles/appStyles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.length > 0 && !loading;
  }, [username, password, loading]);

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert("Validación", "Usuario y contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: b64encode(username.trim()),
        password: b64encode(password),
      };

   //   const res = await fetch(`/api/auth/login`, {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
       /* const msg =
          (data && (data.message || data.status)) ||
          (res.status === 401 ? "Credenciales inválidas." : `Error al iniciar sesión (HTTP ${res.status}).`); */
        const msg =
          (res.status === 401 ? "Credenciales inválidas." : `Error al iniciar sesión (HTTP ${res.status}).`);
        notify("Login", msg);
        return;
      }

      // Ajusta a lo que tu API regrese:
      // Ej: { token: "...", user: {...} }
      const token = data?.data.token.token;

      if (!token) {
        Alert.alert("Login", "La API no regresó token. Ajusta el backend o el cliente.");
        return;
      }

      Alert.alert("Token","Token"+token);

      // Delegamos el guardado del token al app (o lo haces aquí con SecureStore)
      onLoginSuccess?.({ token, user: data?.data.user.username });

    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con la API. Revisa URL, red y CORS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={appStyles.page}>
      <View style={appStyles.card}>
        <Text style={appStyles.title}>Iniciar sesión</Text>
        <Text style={appStyles.subtitle}>Accede con tu usuario y contraseña</Text>

        <Text style={appStyles.label}>Usuario</Text>
        <TextInput
          style={appStyles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Usuario"
          textContentType="username"
          returnKeyType="next"
        />

        <Text style={appStyles.label}>Contraseña</Text>
        <View style={appStyles.passwordRow}>
          <TextInput
            style={[appStyles.input, { flex: 1, marginBottom: 0 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Pressable style={appStyles.toggleBtn} onPress={() => setShowPassword((v) => !v)}>
            <Text style={appStyles.toggleBtnText}>{showPassword ? "Ocultar" : "Mostrar"}</Text>
          </Pressable>
        </View>

        <Pressable
          style={[appStyles.submitBtn, { opacity: canSubmit ? 1 : 0.6 }]}
          disabled={!canSubmit}
          onPress={handleLogin}
        >
          {loading ? <ActivityIndicator /> : <Text style={appStyles.submitBtnText}>Entrar</Text>}
        </Pressable>
      </View>
    </View>
  );
}