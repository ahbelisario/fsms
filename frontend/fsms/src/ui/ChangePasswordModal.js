import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { ScreenStyles } from "@/src/styles/appStyles";
import { api } from "@/src/api/client";
import { encode as b64encode } from "base-64";

export default function ChangePasswordModal({
  visible,
  userId,
  onClose,
  onSuccess,
  onAuthExpired,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError("");
      setSaving(false);
    }
  }, [visible]);

  function validate() {
    if (!userId) return "No se pudo identificar el usuario.";
    if (!currentPassword) return "Contraseña actual requerida.";
    if (!newPassword) return "Nueva contraseña requerida.";
    if (newPassword.length < 8) return "La nueva contraseña debe tener al menos 8 caracteres.";
    if (newPassword !== confirmNewPassword) return "Las nuevas contraseñas no coinciden.";
    if (newPassword === currentPassword) return "La nueva contraseña debe ser diferente a la actual.";
    return "";
  }

  async function handleSubmit() {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setSaving(true);

    try {

      const payload = {
          password: b64encode(currentPassword)
        };

      const passwordMatch = await api.checkPassword(userId, payload);

      if (passwordMatch?.status === "error") return setError("Contraseña actual no coincide");
      
      try {

        const payload = {
          password: b64encode(currentPassword),
          newPassword: b64encode(newPassword)
        };

        await api.updatePassword(userId, payload);

        onClose?.();
        onSuccess?.();
      
      } catch (e) {
          if (e?.code === "AUTH_EXPIRED") {
            onAuthExpired?.();
            return;
          }
        setError(e?.message || "No se pudo cambiar la contraseña.");
      } finally {
        setSaving(false);
      }

    } catch (e){
      if (e?.code === "AUTH_EXPIRED") {
            onAuthExpired?.();
            return;
          }

    } finally {
      setSaving(false);
    }

  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ScreenStyles.modalBackdrop}>
        <View style={ScreenStyles.modalCard}>
          <Text style={ScreenStyles.modalTitle}>Cambiar contraseña</Text>

          {error ? (
            <View style={ScreenStyles.alertError}>
              <Text style={ScreenStyles.alertErrorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={ScreenStyles.label}>Contraseña actual</Text>
          <TextInput
            style={ScreenStyles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!saving}
          />

          <Text style={ScreenStyles.label}>Nueva contraseña</Text>
          <TextInput
            style={ScreenStyles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!saving}
          />

          <Text style={ScreenStyles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={ScreenStyles.input}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!saving}
          />

           {newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? (
              <Text style={{ color: "#b91c1c", marginTop: 6 }}>
                Las contraseñas no coinciden.
              </Text>
            ) : null}


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
