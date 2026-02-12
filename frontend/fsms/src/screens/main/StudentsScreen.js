import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View, SectionList, Switch} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { useRouter } from "expo-router";
import { t } from "@/src/i18n";
import { Ionicons } from "@expo/vector-icons";


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
  const ROLE_LABELS = { admin: t("users.role_admin"), user: t("users.role_user") };

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const sectionListRef = React.useRef(null);

  const visibleUsers = users.filter((u) => u.username !== "admin"); 

  const disableSave = saving || (!isEditing && (!!password || !!confirmPassword) && password !== confirmPassword);
  const [expandedLetters, setExpandedLetters] = useState({});

  function toggleLetter(letter) {
    setExpandedLetters((prev) => ({ ...prev, [letter]: !prev[letter] }));
  }

  function scrollToLetter(letter) {
    toggleLetter(letter);
    const sections = buildLetterSections(visibleUsers);
    const index = sections.findIndex(s => s.title === letter);
    if (index >= 0 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: index,
        itemIndex: 0,
        animated: true,
      });
    }
  }

  function normalizeLetter(name) {
    const s = String(name ?? "").trim();
    if (!s) return "#";

    const first = s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .charAt(0)
      .toUpperCase();

    return /^[A-Z]$/.test(first) ? first : "#";
  }

  function buildLetterSections(list) {
    const map = new Map();

    const sorted = [...list].sort((a, b) => {
      const an = `${a.name ?? ""} ${a.lastname ?? ""}`.trim().toLowerCase();
      const bn = `${b.name ?? ""} ${b.lastname ?? ""}`.trim().toLowerCase();
      return an.localeCompare(bn);
    });

    for (const u of sorted) {
      const letter = normalizeLetter(u.name ?? u.username ?? "");
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(u);
    }

    const letters = Array.from(map.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    return letters.map((letter) => ({
      title: letter,
      data: map.get(letter),
    }));
  }

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
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setUsers(list);

      const visible = list.filter((u) => u.username !== "admin");
      const sections = buildLetterSections(visible);
      const first = sections[0]?.title;
      if (first) setExpandedLetters({ [first]: true });

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
      setSuccess("User created.")

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
  }

  return (
    
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>{t("students.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("students.add")}</Text>
        </Pressable>
      </View>
      
      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadUsers} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {/* Barra alfabética */}
      {!loading && visibleUsers.length > 0 && (
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: 8, 
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: '#f8fafc',
          borderRadius: 8,
          marginBottom: 8,
          marginTop: 8
        }}>
          {buildLetterSections(visibleUsers).map(section => (
            <Pressable
              key={section.title}
              onPress={() => scrollToLetter(section.title)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: expandedLetters[section.title] ? '#3b82f6' : '#e2e8f0',
                borderRadius: 6,
                minWidth: 45,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: expandedLetters[section.title] ? '#ffffff' : '#475569',
                fontWeight: '600',
                fontSize: 14
              }}>
                {section.title}
              </Text>
              <Text style={{
                color: expandedLetters[section.title] ? '#dbeafe' : '#64748b',
                fontSize: 11,
                marginTop: 2
              }}>
                {section.data.length}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={buildLetterSections(visibleUsers)}
          keyExtractor={(u) => String(u.id)}
          stickySectionHeadersEnabled={false}
          refreshing={loading}
          onRefresh={loadUsers}
          renderSectionHeader={() => null}
          renderItem={({ item, section }) => {
            if (!expandedLetters[section.title]) return null;

            return (
              <View style={[ScreenStyles.row, { minWidth: 0, width: "100%" }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[ScreenStyles.rowTitle, { fontSize: 14, flexShrink: 1 , borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 13, marginBottom: 12 }]}>
                      {item.name ?? "(sin nombre)"} {item.lastname ?? ""}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[ScreenStyles.rowMeta, { fontSize:14 }]}>
                          {t("users.username") + ": " + item.username ?? ""}
                        </Text>
                        <Text style={ScreenStyles.rowMeta}>
                          {item.role ? `${t("users.role")}: ${ROLE_LABELS[item.role] ?? item.role}` : ""}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end'  }}>
                          <Pressable style={{minWidth: 0, alignItems: 'center'}} onPress={() => askDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#d60000" />
                    <Text style={[ScreenStyles.rowMeta, { fontSize: 10 }]}>{t("common.delete")}</Text>
                  </Pressable>
                        </View>
                    </View>
                  </View>
                </View>
                <View style={{ flex: 1 , maxWidth: 50 }}>  
                  <Pressable style={{minWidth: 0, alignItems: 'center', paddingBottom: 7}} onPress={() => openEdit(item)}>
                    <Ionicons name="pencil" size={18} color="#0b1220" />
                    <Text style={[ScreenStyles.rowMeta, { fontSize: 10 }]}>{t("common.edit")}</Text>
                  </Pressable>

                  <Pressable style={{minWidth: 0, alignItems: 'center'}} onPress={() => router.push(`/(app)/userprofiles/${item.id}`)}>
                    <Ionicons name="person-circle-outline" size={18} color="#0b1220" />
                    <Text style={[ScreenStyles.rowMeta, { fontSize: 10 }]}>{t("userprofiles.title")}</Text>
                  </Pressable>

                  
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={ScreenStyles.center}>
              <Text style={{ color: "#64748b" }}>{t("users.empty")}</Text>
            </View>
          }
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

              {password && confirmPassword && password !== confirmPassword ? (
                <Text style={{ color: "#b91c1c", marginTop: 6 }}>
                  {t("messages.password_dont_match")}
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