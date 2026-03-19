import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { appStyles } from "@/src/styles/appStyles";
import { notifyError, notifySuccess } from "@/src/ui/notify";
import { i18n, t } from "@/src/i18n";
import { API_BASE_URL } from '@/src/config/api.config';

/**
 * Validar fortaleza de contraseña
 */
function validatePasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = t("common.strength.very_weak");
  let color = "#dc2626"; // rojo

  if (score >= 5) {
    strength = t("common.strength.strong");
    color = "#10b981"; // verde
  } else if (score >= 4) {
    strength = t("common.strength.medium");
    color = "#f59e0b"; // amarillo
  } else if (score >= 3) {
    strength = t("common.strength.weak");
    color = "#f97316"; // naranja
  }

  return { checks, strength, color, score };
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userName, setUserName] = useState("");
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Calcular fortaleza de contraseña
  const passwordStrength = useMemo(() => {
    return validatePasswordStrength(newPassword);
  }, [newPassword]);

  // Verificar token al cargar
  useEffect(() => {
    if (!token) {
      notifyError(t("messages.error.invalid_token"));
      router.replace("/(auth)");
      return;
    }

    verifyToken();
  }, [token]);

  async function verifyToken() {
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/password-reset/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (res.ok) {
        setTokenValid(true);
        setUserName(data.data ? `${data.data.name} ${data.data.lastname}` : "");
      } else {
        notifyError(t("messages.error.token_expired"));
        setTimeout(() => {
          router.replace("/(auth)/forgot-password");
        }, 2000);
      }
    } catch (e) {
      console.error(e);
      notifyError(t("messages.error.connecting_server"));
      setTimeout(() => {
        router.replace("/(auth)");
      }, 2000);
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit() {
    if (!newPassword || !confirmPassword) {
      notifyError(t("messages.error.missing_fields"));
      return;
    }

    if (passwordStrength.score < 3) {
      notifyError(t("messages.error.weak_password"));
      return;
    }

    if (newPassword !== confirmPassword) {
      notifyError(t("messages.error.passwords_dont_match"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword 
        })
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess(t("messages.success.password_changed"));
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.replace("/(auth)");
        }, 2000);
      } else {
        notifyError(data.message || t("messages.error.password_change_failed"));
      }
    } catch (e) {
      console.error(e);
      notifyError(t("messages.error.connecting_server"));
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <View style={appStyles.page}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16, color: "#64748b" }}>
            {t("common.verifying")}...
          </Text>
        </View>
      </View>
    );
  }

  if (!tokenValid) {
    return null; // Ya redirigió
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={appStyles.page}
    >
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        paddingHorizontal: 16,
        paddingVertical: 20 
      }}>
        <View style={{ 
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={appStyles.title}>{t("reset_password.title")}</Text>
          <Text style={appStyles.subtitle}>{t("reset_password.subtitle")}</Text>

          {userName && (
            <View style={{ 
              backgroundColor: '#f0fdf4', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#10b981'
            }}>
              <Text style={{ color: '#166534', fontWeight: '600' }}>
                👤 {userName}
              </Text>
            </View>
          )}

          <Text style={appStyles.label}>{t("reset_password.new_password")} *</Text>
          <TextInput
            style={appStyles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            onFocus={() => setShowPasswordStrength(true)}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
          />

          {/* Indicador de fortaleza */}
          {showPasswordStrength && newPassword.length > 0 && (
            <View style={{ marginTop: 8, marginBottom: 12 }}>
              <View style={{ 
                height: 4, 
                backgroundColor: '#e2e8f0', 
                borderRadius: 2,
                marginBottom: 8,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: passwordStrength.color,
                }} />
              </View>

              <Text style={{ 
                fontSize: 12, 
                color: passwordStrength.color,
                fontWeight: '600',
                marginBottom: 6
              }}>
                {t("register.strength")}: {passwordStrength.strength}
              </Text>

              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.length ? '#10b981' : '#94a3b8' }}>
                  {passwordStrength.checks.length ? '✓' : '○'} {t("register.min_8")}
                </Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.uppercase ? '#10b981' : '#94a3b8' }}>
                  {passwordStrength.checks.uppercase ? '✓' : '○'} {t("register.one_cap")}
                </Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.lowercase ? '#10b981' : '#94a3b8' }}>
                  {passwordStrength.checks.lowercase ? '✓' : '○'} {t("register.one_nocap")}
                </Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.number ? '#10b981' : '#94a3b8' }}>
                  {passwordStrength.checks.number ? '✓' : '○'} {t("register.one_num")}
                </Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.special ? '#10b981' : '#94a3b8' }}>
                  {passwordStrength.checks.special ? '✓' : '○'} {t("register.one_char")}
                </Text>
              </View>
            </View>
          )}

          <Text style={appStyles.label}>{t("common.password_confirm")} *</Text>
          <TextInput
            style={appStyles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
          />

          {newPassword !== confirmPassword && confirmPassword.length > 0 && (
            <Text style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              {t("messages.error.passwords_dont_match")}
            </Text>
          )}

          <Pressable
            style={[
              appStyles.submitBtn, 
              { 
                opacity: newPassword && confirmPassword && newPassword === confirmPassword && !loading ? 1 : 0.6, 
                marginTop: 20 
              }
            ]}
            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || loading}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={appStyles.submitBtnText}>{t("reset_password.reset_button")}</Text>
            )}
          </Pressable>

          <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center", gap: 4 }}>
            <Text style={{ color: "#64748b" }}>{t("forgot_password.remember_password")}</Text>
            <Pressable onPress={() => router.replace("/(auth)")}>
              <Text style={{ color: "#3b82f6", fontWeight: "600" }}>{t("login.title")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}