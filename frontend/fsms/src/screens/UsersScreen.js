import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View, Switch} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "../api/client";
import { ScreenStyles } from '../styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { useRouter } from "expo-router";
import { t } from "@/src/i18n";
import { loadLang } from "@/src/i18n/lang";

export default function UsersScreen({ onAuthExpired }) {
  
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [active, setActive] = useState(true);

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const ROLE_LABELS = { admin: "Administrador", user: "Usuario" };

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const visibleUsers = users.filter((u) => u.username !== "admin"); 

  const disableSave = saving || (!isEditing && (!!password || !!confirmPassword) && password !== confirmPassword);


  function askDelete(id) {
    setToDeleteId(id);
    setConfirmVisible(true);
  }

  async function confirmDelete() {
    setConfirmVisible(false);
    await remove(toDeleteId);
    setToDeleteId(null);
  }

  function cancelDelete() {
    setConfirmVisible(false);
    setToDeleteId(null);
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setUsername("");
    setLastName("");
    setEmail("");
    setRole("user");
    setPassword("");
    setConfirmPassword("");
    setActive(true);
  }

  function openCreate() {
    clearMsgs();
    resetForm();
    setModalVisible(true);
  }

  function openEdit(u) {
    clearMsgs();
    setEditingId(u.id);
    setName(u.name ?? "");
    setLastName(u.lastname ?? "");
    setEmail(u.email ?? "");
    setUsername(u.username ?? "");

    const normalizedRole = String(u.role ?? "user").toLowerCase();
    setRole(normalizedRole === "admin" ? "admin" : "user");

    setPassword("");
    setConfirmPassword("");

    setActive(u.active ?? true);
    setModalVisible(true);
  }

  async function loadUsers() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.listUsers();
      // Soporta: [..] o {response:[..]} o {data:[..]}
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setUsers(list);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function validate() {
    if (!name.trim()) return "Nombre requerido.";
    if (!lastname.trim()) return "Apellido requerido.";
    if (!email.trim()) return "Correo Electronico requerido.";
    if (!username.trim()) return "Nombre de Usuario requerido.";
    if (!role.trim()) return "Rol requerido.";
    if (!isEditing) {
      if (!password) return "Password requerido al crear.";
      if (password !== confirmPassword) return "Las contraseñas no coinciden.";
      if (password.length < 8) return "El password debe tener al menos 8 caracteres.";
    }
    return "";
  }

  async function save() {
    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {

      if (isEditing) {
          const payload = {
            username: username.trim(),
            name: name.trim(),
            lastname: lastname.trim(),
            email: email.trim(),
            role: role.trim(),
            active: active
           };
      
        await api.updateUser(editingId, payload);
        setSuccess("Usuario actualizado.");

      } else {
         const payload = {
          username: username.trim(),
          name: name.trim(),
          lastname: lastname.trim(),
          email: email.trim(),
          role: role.trim(),
          active: active,
          ...(password ? { password } : {}),
        };

      const user_data = await api.createUser(payload);

      const payload_up = {
          user_id: user_data.data.id,
          name: name.trim(),
          lastname: lastname.trim(),
          email: email.trim()
        };

        await api.createUserProfiles(payload_up);
        setSuccess("Perfil creado.");

      const language = await loadLang();

      const payload_us = {
          user_id: user_data.data.id,
          language: language
        };

      await api.createUserSettings(payload_us);
        setSuccess("Preferencias del usuario creadas.");

      }

      setModalVisible(false);
      resetForm();
      await loadUsers();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    clearMsgs();
    setLoading(true);
    try {
      await api.deleteUser(id);
      setSuccess("Usuario eliminado.");
      await loadUsers();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }

   // <Text style={ScreenStyles.label}>Password {isEditing ? "(opcional)" : "(requerido)"}</Text>
   // <TextInput editable={isEditing ? false : true} style={isEditing ? [ScreenStyles.input,{ backgroundColor: "#e5e7eb", color: "#6b7280" }] : ScreenStyles.input} value={password} onChangeText={setPassword} secureTextEntry />

  }

  return (
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>{t("users.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("users.add")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadUsers} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={visibleUsers}
          refreshing={loading}
          onRefresh={loadUsers}
          keyExtractor={(u) => String(u.id)}
          renderItem={({ item }) => (
            <View style={ScreenStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowTitle}>{item.name ?? "(sin nombre)"}{item.username !== "admin" && ` ${item.lastname ?? "(sin apellido)"}`}</Text>
                <Text style={ScreenStyles.rowMeta}>{`Usuario: ${item.username ?? ""}`}{item.role ? ` • Rol: ${ROLE_LABELS[item.role] ?? item.role}` : ""}</Text>
              </View>
              <Pressable style={ScreenStyles.smallBtn} onPress={() => openEdit(item)}>
                <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
              </Pressable>
              <Pressable style={[ScreenStyles.smallBtn, { backgroundColor: "#64748b" }]} onPress={() => router.push(`/(app)/userprofiles/${item.id}`)}>
                <Text style={ScreenStyles.smallBtnText}>{t("userprofiles.title")}</Text>
              </Pressable>
              <Pressable style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} onPress={() => askDelete(item.id)}>
                <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<View style={ScreenStyles.center}><Text style={{ color: "#64748b" }}>{t("users.empty")}</Text></View>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing ? t("users.edituser") : t("users.createuser")} </Text>

            <Text style={ScreenStyles.label}>{t("login.username")}</Text>
            <TextInput style={ScreenStyles.input} value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />

            <Text style={ScreenStyles.label}>{t("userprofiles.name")}</Text>
            <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />

            <Text style={ScreenStyles.label}>{t("userprofiles.lastname")}</Text>
            <TextInput style={ScreenStyles.input} value={lastname} onChangeText={setLastName} />

            <Text style={ScreenStyles.label}>{t("userprofiles.email")}</Text>
            <TextInput style={ScreenStyles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}/>

            <View style={{ marginBottom: 12 }}>
                <Text style={ScreenStyles.label}>{t("users.role")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                    <Picker selectedValue={role} onValueChange={setRole}>
                        <Picker.Item label={t("users.role_user")} value="user" />
                        <Picker.Item label={t("users.role_admin")} value="admin" />
                    </Picker>
                </View>
            </View>
            {!isEditing && (
            <>
              <Text style={ScreenStyles.label}>{t("common.password_required")}</Text>
              <TextInput style={ScreenStyles.input} value={password} onChangeText={setPassword} secureTextEntry />

              <Text style={ScreenStyles.label}>{t("common.password_confirm")}</Text>
              <TextInput style={ScreenStyles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

              {/* Mensaje inline opcional */}
              {password && confirmPassword && password !== confirmPassword ? (
                <Text style={{ color: "#b91c1c", marginTop: 6 }}>
                  {t("messages.assword_dont_match")}
                </Text>
              ) : null}
            </>
)}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 , marginTop: 12 }}>
                <Text>{t("users.active")}</Text>
                <Switch disabled={username === "admin" ? true : false} value={active} onValueChange={setActive}/>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable style={[ScreenStyles.btnSecondary, { flex: 1 }]} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={ScreenStyles.btnSecondaryText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable style={[ScreenStyles.btnPrimary, { flex: 1, opacity: disableSave ? 0.7 : 1 }]} onPress={save} disabled={disableSave}>
                <Text style={ScreenStyles.btnPrimaryText}>{saving ? t("common.saving") : t("common.save")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title={t("dialogs.delete_user")}
        message={t("messages.sure_delete_user")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

    </View>
  );
}