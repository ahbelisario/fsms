import React, { useMemo, useState, useEffect } from "react";
import { Alert, ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { encode as b64encode } from "base-64";
import { notify } from "@/src/ui/notify";
import { appStyles } from '@/src/styles/appStyles';
import { i18n, t } from "@/src/i18n";
import { setLang } from "@/src/i18n/lang";
import { API_BASE_URL } from '@/src/config/api.config';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dojoLogo, setDojoLogo] = useState(null);

  const [, force] = useState(0);

  async function changeLang(lang) {
    await setLang(lang);
    force((v) => v + 1);
  }

  // Cargar logo del dojo al montar el componente
  useEffect(() => {
    async function loadDojoLogo() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dojo-settings-public`);
        if (res.ok) {
          const data = await res.json();
          const logoUrl = data?.data?.logo_url || data?.logo_url;
          if (logoUrl) {
            setDojoLogo(logoUrl);
          }
        }
      } catch (error) {
        console.log('Error loading dojo logo:', error);
        // No hacer nada si falla, simplemente no mostrar logo
      }
    }
    loadDojoLogo();
  }, []);

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

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = res.status === 401
          ? "Credenciales inválidas."
          : `Error al iniciar sesión (HTTP ${res.status}).`;
        notify("Login", msg);
        return;
      }

      const token = data?.data.token.token;

      if (!token) {
        Alert.alert("Login", "La API no regresó token. Ajusta el backend o el cliente.");
        return;
      }

      onLoginSuccess?.({ token, role: data?.data.user.role });

    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con la API. Revisa URL, red y CORS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={appStyles.page}>
      {/* Selector de idioma */}
      <View style={{position: "absolute", top: 16, right: 16, flexDirection: "row", gap: 6}}>
        <Pressable onPress={() => changeLang("es")}>
          <Text style={{ fontWeight: i18n.locale === "es" ? "800" : "400" }}>ES</Text>
        </Pressable>
        <Text>|</Text>
        <Pressable onPress={() => changeLang("en")}>
          <Text style={{ fontWeight: i18n.locale === "en" ? "800" : "400" }}>EN</Text>
        </Pressable>
      </View>

      {/* Contenedor centrado para logo + card */}
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 16
      }}>
      
        {/* Card de login */}
        <View style={appStyles.card}>

          {/* Logo del dojo */}
          {dojoLogo && (
              <img 
                src={dojoLogo} 
                alt="Logo"
                style={{ marginBottom: 40 }}
              />
          )}

          <Text style={appStyles.title}>{t("login.title")}</Text>
          <Text style={appStyles.subtitle}>{t("login.subtitle")}</Text>

          <Text style={appStyles.label}>{t("login.username")}</Text>
          <TextInput
            style={appStyles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t("login.username")}
            textContentType="username"
            returnKeyType="next"
          />

          <Text style={appStyles.label}>{t("login.password")}</Text>
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
              <Text style={appStyles.toggleBtnText}>{showPassword ? t("common.hide") : t("common.show")}</Text>
            </Pressable>
          </View>

          <Pressable
            style={[appStyles.submitBtn, { opacity: canSubmit ? 1 : 0.6 }]}
            disabled={!canSubmit}
            onPress={handleLogin}
          >
            {loading ? <ActivityIndicator /> : <Text style={appStyles.submitBtnText}>{t("login.signIn")}</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}