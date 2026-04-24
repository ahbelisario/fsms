import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { appStyles, ScreenStyles } from "@/src/styles/appStyles";
import { notifyError, notifySuccess } from "@/src/ui/notify";
import { i18n, t } from "@/src/i18n";
import { setLang } from "@/src/i18n/lang";
import { api } from "@/src/api/client";
import { API_BASE_URL } from '@/src/config/api.config';

const validators = {
  nameChars: (text) => text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''),
  usernameChars: (text) => text.replace(/[^a-zA-Z0-9._@-]/g, ''),
  emailChars: (text) => text.replace(/[^a-zA-Z0-9._@+-]/g, ''),
};

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
  let color = "#dc2626";

  if (score >= 5) { strength = t("common.strength.strong"); color = "#10b981"; }
  else if (score >= 4) { strength = t("common.strength.medium"); color = "#f59e0b"; }
  else if (score >= 3) { strength = t("common.strength.weak"); color = "#f97316"; }

  return { checks, strength, color, score };
}

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState(i18n.locale);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyVersion, setPrivacyVersion] = useState("1.0"); // fallback

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [loading, setLoading] = useState(false);

  const [, force] = useState(0);

  // Cargar versión del aviso de privacidad desde el API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/privacy/version`)
      .then((r) => r.json())
      .then((d) => { if (d?.data?.version) setPrivacyVersion(d.data.version); })
      .catch(() => {}); // si falla, usa el fallback "1.0"
  }, []);

  async function changeLang(lang) {
    await setLang(lang);
    force((v) => v + 1);
    setLanguage(lang);
  }

  const handleNameChange = (text) => setName(validators.nameChars(text));
  const handleLastnameChange = (text) => setLastname(validators.nameChars(text));
  const handleUsernameChange = (text) => setUsername(validators.usernameChars(text.toLowerCase()));
  const handleEmailChange = (text) => setEmail(validators.emailChars(text.toLowerCase()));

  const passwordStrength = useMemo(() => validatePasswordStrength(password), [password]);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      lastname.trim().length > 0 &&
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      confirmPassword === password &&
      passwordStrength.score >= 3 &&
      privacyAccepted &&
      !loading
    );
  }, [name, lastname, username, email, password, confirmPassword, passwordStrength.score, privacyAccepted, loading]);

  async function handleRegister() {
    if (!name.trim() || !lastname.trim() || !username.trim() || !email.trim()) {
      notifyError(t("messages.error.missing_fields"));
      return;
    }
    if (passwordStrength.score < 3) {
      notifyError(t("messages.error.weak_password"));
      return;
    }
    if (password !== confirmPassword) {
      notifyError(t("messages.error.passwords_dont_match"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        lastname: lastname.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        language: language,
        privacy_accepted: true,
        privacy_version: privacyVersion, // ← viene del API
      };
      await api.register(payload);
      notifySuccess("✅ " + t("messages.success.email_success"));
      setTimeout(() => { router.replace("/(auth)"); }, 3000);
    } catch (e) {
      console.error(e);
      notifyError(e.message || t("messages.error.connecting_server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={appStyles.page}
    >
      {/* Selector de idioma */}
      <View style={{ position: "absolute", top: 16, right: 16, flexDirection: "row", gap: 6 }}>
        <Pressable onPress={() => changeLang("es")}>
          <Text style={{ fontWeight: i18n.locale === "es" ? "800" : "400" }}>ES</Text>
        </Pressable>
        <Text>|</Text>
        <Pressable onPress={() => changeLang("en")}>
          <Text style={{ fontWeight: i18n.locale === "en" ? "800" : "400" }}>EN</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16, paddingVertical: 20 }}>
        <View style={[appStyles.card, { maxWidth: 500, width: '100%' }]}>
          <Text style={appStyles.title}>{t("register.create_account")}</Text>
          <Text style={appStyles.subtitle}>{t("register.to_begin")}</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={appStyles.label}>{t("userprofiles.name")} *</Text>
              <TextInput style={appStyles.input} value={name} onChangeText={handleNameChange} placeholder="Juan" autoCapitalize="words" placeholderTextColor="#94a3b8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={appStyles.label}>{t("userprofiles.lastname")} *</Text>
              <TextInput style={appStyles.input} value={lastname} onChangeText={handleLastnameChange} placeholder="Pérez" autoCapitalize="words" placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <Text style={appStyles.label}>{t("users.username")} *</Text>
          <TextInput style={appStyles.input} value={username} onChangeText={handleUsernameChange} placeholder="juanperez" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#94a3b8" />
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: -7, marginBottom: 14 }}>
            {t("register.username_hint")}
          </Text>

          <Text style={appStyles.label}>{t("userprofiles.email")} *</Text>
          <TextInput style={appStyles.input} value={email} onChangeText={handleEmailChange} placeholder="juan@ejemplo.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholderTextColor="#94a3b8" />

          <Text style={appStyles.label}>{t("login.password")} *</Text>
          <View style={appStyles.passwordRow}>
            <TextInput
              style={[appStyles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setShowPasswordStrength(true)}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {showPasswordStrength && password.length > 0 && (
            <View style={{ marginTop: 8, marginBottom: 12 }}>
              <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }} />
              </View>
              <Text style={{ fontSize: 12, color: passwordStrength.color, fontWeight: '600', marginBottom: 6 }}>
                {t("register.strength")}: {passwordStrength.strength}
              </Text>
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.length ? '#10b981' : '#94a3b8' }}>{passwordStrength.checks.length ? '✓' : '○'} {t("register.min_8")}</Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.uppercase ? '#10b981' : '#94a3b8' }}>{passwordStrength.checks.uppercase ? '✓' : '○'} {t("register.one_cap")}</Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.lowercase ? '#10b981' : '#94a3b8' }}>{passwordStrength.checks.lowercase ? '✓' : '○'} {t("register.one_nocap")}</Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.number ? '#10b981' : '#94a3b8' }}>{passwordStrength.checks.number ? '✓' : '○'} {t("register.one_num")}</Text>
                <Text style={{ fontSize: 11, color: passwordStrength.checks.special ? '#10b981' : '#94a3b8' }}>{passwordStrength.checks.special ? '✓' : '○'} {t("register.one_char")}</Text>
              </View>
            </View>
          )}

          <Text style={appStyles.label}>{t("common.password_confirm")} *</Text>
          <View style={appStyles.passwordRow}>
            <TextInput
              style={[appStyles.input, { flex: 1, marginBottom: 0 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {password !== confirmPassword && confirmPassword.length > 0 && (
            <Text style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
              {t("messages.error.passwords_dont_match")}
            </Text>
          )}

          {/* Checkbox aviso de privacidad */}
          <Pressable
            onPress={() => setPrivacyAccepted((v) => !v)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, marginBottom: 4 }}
          >
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: privacyAccepted ? "#5ea4c5ff" : "#cbd5e1",
              backgroundColor: privacyAccepted ? "#5ea4c5ff" : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {privacyAccepted && <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 12, color: "#475569", flex: 1 }}>
              {t("privacy.accept")}{" "}
              <Text
                style={{ color: "#5ea4c5ff", textDecorationLine: "underline" }}
                onPress={() => router.push("/(auth)/privacy-notice")}
              >
                {t("privacy.view_privacy")}
              </Text>
            </Text>
          </Pressable>

          <Pressable
            style={[appStyles.submitBtn, { opacity: canSubmit ? 1 : 0.6, marginTop: 16 }]}
            disabled={!canSubmit}
            onPress={handleRegister}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={appStyles.submitBtnText}>{t("common.register")}</Text>}
          </Pressable>

          <View style={{ marginTop: 20, justifyContent: "center", gap: 4 }}>
            <Text style={[appStyles.label, { fontSize: 14, textAlign: "center" }]}>{t("messages.questions.do_you_have_an_account")}</Text>
            <Pressable
              style={[ScreenStyles.btnSecondary, { marginBottom: 2 }]}
              onPress={() => router.replace("/(auth)")}
            >
              <Text style={ScreenStyles.btnPrimaryText}>{t("login.title")}</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}