import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { appStyles } from "@/src/styles/appStyles";
import { notifyError, notifySuccess } from "@/src/ui/notify";
import { i18n, t } from "@/src/i18n";
import { API_BASE_URL } from '@/src/config/api.config';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text) => {
    // Limpiar email - solo caracteres válidos
    const cleaned = text.replace(/[^a-zA-Z0-9._@+-]/g, '').toLowerCase();
    setEmail(cleaned);
  };

  async function handleSubmit() {
    if (!email.trim()) {
      notifyError(t("messages.error.email_required"));
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notifyError(t("messages.error.invalid_email"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess(t("messages.success.password_reset_sent"));
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.replace("/(auth)");
        }, 3000);
      } else {
        notifyError(data.message || t("messages.error.connecting_server"));
      }
    } catch (e) {
      console.error(e);
      notifyError(t("messages.error.connecting_server"));
    } finally {
      setLoading(false);
    }
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
          <Text style={appStyles.title}>{t("forgot_password.title")}</Text>
          <Text style={appStyles.subtitle}>{t("forgot_password.subtitle")}</Text>

          <Text style={appStyles.label}>{t("userprofiles.email")} *</Text>
          <TextInput
            style={appStyles.input}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#94a3b8"
          />

          <Pressable
            style={[appStyles.submitBtn, { opacity: email && !loading ? 1 : 0.6, marginTop: 20 }]}
            disabled={!email || loading}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={appStyles.submitBtnText}>{t("forgot_password.send_link")}</Text>
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