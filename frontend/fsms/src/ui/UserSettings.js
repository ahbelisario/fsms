import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { ScreenStyles } from "@/src/styles/appStyles";
import { api } from "@/src/api/client";
import { t } from "@/src/i18n";
import { Picker } from "@react-native-picker/picker";
import { setLang } from "@/src/i18n/lang";

export default function UserSettingsModal({
  lang,
  visible,
  userId,
  onClose,
  onSuccess,
  onAuthExpired,
  onLanguageChanged,
}) {

  const [language, setLanguage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      loadUserSettings();
      setError("");
      setSaving(false);
    }
  }, [visible]);

  function validate() {
    if (!userId) return "No se pudo identificar el usuario.";
    if (!language) return "Idioma requerido";
    return "";
  }

  async function loadUserSettings() {
  
    const user_Settings = await api.listUserSettings(userId);
    setLanguage(user_Settings?.language);
    
  }

  async function handleSubmit() {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setSaving(true);

    try {

        const payload = { lang: language };
        await api.updateUserSettingLanguage(userId, payload);
        
        await setLang(language);
        onLanguageChanged?.(language);

        onClose?.();
        onSuccess?.();
      
      } catch (e) {
          if (e?.code === "AUTH_EXPIRED") {
            onAuthExpired?.();
            return;
          }
        setError(e?.message || "No se pudo cambiar el lenguaje preferido.");
      } finally {
        setSaving(false);
      }

  }

  return (
    <Modal key={lang} visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ScreenStyles.modalBackdrop}>
        <View style={ScreenStyles.modalCard}>
          <Text style={ScreenStyles.modalTitle}>Preferencias del Usuario</Text>

          {error ? (
            <View style={ScreenStyles.alertError}>
              <Text style={ScreenStyles.alertErrorText}>{error}</Text>
            </View>
          ) : null}

          <View>
              <Text style={ScreenStyles.label}>{t("usersettings.language")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker selectedValue={language} onValueChange={setLanguage}>
                  <Picker.Item label={t("usersettings.english")} value="en" />
                  <Picker.Item label={t("usersettings.spanish")} value="es" />
                </Picker>
              </View>
            </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable
              style={[ScreenStyles.btnSecondary, { flex: 1, opacity: saving ? 0.7 : 1 }]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={ScreenStyles.btnSecondaryText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[ScreenStyles.btnPrimary, { flex: 1, opacity: saving ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center" }}>
                  <ActivityIndicator />
                  <Text style={ScreenStyles.btnPrimaryText}>Guardando...</Text>
                </View>
              ) : (
                <Text style={ScreenStyles.btnPrimaryText}>Cambiar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
