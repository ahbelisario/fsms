import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ScrollView, RefreshControl, Switch } from "react-native";
import { clearAuthSession } from "@/src/storage/authStorage";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { appStyles, ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import DatePickerField from "@/src/ui/DatePickerField";
import ChangePasswordModal from "@/src/ui/ChangePasswordModal";
import { t } from "@/src/i18n";
import { Ionicons } from "@expo/vector-icons";


export default function UserProfilesScreen({ onAuthExpired, targetUserId }) {

  const router = useRouter();
  
  const [changePwdVisible, setChangePwdVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [ranks, setRanks] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  
  const [user, setUser] = useState({});

  const [idtouse, setIdtoUse] = useState(null);
  const [myrole, setMyRole] = useState("");
  const [myid, setMyId] = useState("");

  const [userdata, setUserData] = useState([]);
  const [userprofiles, setUserProfiles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [language, setLanguage] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [name, setName] = useState("");
  const [lastname, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [date_of_birth, setDateofBirth] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency_contact_name, setEmergencyContantName] = useState("");
  const [emergency_contact_phone, setEmergencyContantPhone] = useState("");
  const [address_line1, setAddressLine1] = useState("");
  const [address_line2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postal_code, setPostalCode] = useState("");
  const [discipline_id, setDisciplineId] = useState(null);
  const [rank_id, setRankId] = useState("");
  const [start_date, setStartDate] = useState(null);
  const [current_rank_start_date, setCurrentRankStartDate] = useState(null);
  const [next_exam_date, setNextExamDate] = useState(null);
  const [blood_type, setBloodType] = useState("");
  const [medical_notes, setMedicalNotes] = useState("");
  const [notes, setNotes] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const disableSave = saving || (!isEditing && (!!password || !!confirmPassword) && password !== confirmPassword);

  const isMyProfile = userprofiles && user && Number(userprofiles.user_id) === Number(user.id);
  
  // Filtrar ranks por disciplina seleccionada
  const filteredRanks = useMemo(() => {
    if (!discipline_id) return [];
    return ranks
      .filter(r => Number(r.discipline) === Number(discipline_id))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [ranks, discipline_id]);

  const [confirm, setConfirm] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: t("common.confirm"),
    danger: false,
    action: null,
  });

  // Definir tabs
  const tabs = [
    { id: 0, label: "Login"},
    { id: 1, label: t("userprofiles.personal") },
    { id: 2, label: t("userprofiles.contacto") },
    { id: 3, label: t("userprofiles.marcial") },
    { id: 4, label: t("userprofiles.medical") },
    { id: 5, label: t("common.settings") },
  ];

  function toYMD(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  useFocusEffect(
    useCallback(() => {
      loadUserProfiles();
    }, [targetUserId])
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadUserProfiles();
    } finally {
      setRefreshing(false);
    }
  }

  function askSave() {
    setConfirm({
      visible: true,
      title: isEditing ? t("common.confirmchanges") : "Confirmar creación",
      message: isEditing
        ? t("common.wishchanges")
        : "¿Deseas crear este registro?",
      confirmText: t("common.save"),
      danger: false,
      action: async () => {
        await save();
      },
    });
  }

  function askDelete() {
    setConfirm({
      visible: true,
      title: t("dialogs.delete.delete_user"),
      message: t("messages.sure_delete_user"),
      confirmText: t("common.delete"),
      danger: true,
      action: async () => {
        await deleteUser();
      },
    });
  }

  function cancelConfirm() {
    setConfirm((c) => ({ ...c, visible: false, action: null }));
  }

  async function doConfirm() {
    const action = confirm.action;
    cancelConfirm();
    if (action) await action();
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setUsername("");
    setRole("user");
    setActive(true);
    setName("");
    setLastName("");
    setGender("");
    setDateofBirth(null);
    setEmail("");
    setPhone("");
    setEmergencyContantName("");
    setEmergencyContantPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setCountry("");
    setPostalCode("");
    setDisciplineId(null);
    setRankId(null);
    setStartDate(null);
    setCurrentRankStartDate(null);
    setNextExamDate(null);
    setBloodType("");
    setMedicalNotes("");
    setNotes("");
    setEditingId(null);
  }

  function loadAllFormData(userData, profileData) {
    clearMsgs();
    
    // Siempre cargar datos de usuario si existen
    if (userData) {
      setUsername(userData.username ?? "");
      setRole(userData.role ?? "user");
      setActive(userData.active ?? true);
    }
    
    // Cargar datos de perfil si existen
    if (profileData) {
      setEditingId(profileData.id);
      setName(profileData.name ?? "");
      setLastName(profileData.lastname ?? "");
      setGender(profileData.gender ?? "");
      setDateofBirth(toYMD(profileData.date_of_birth ?? null));
      setEmail(profileData.email ?? "");
      setPhone(profileData.phone ?? "");
      setEmergencyContantName(profileData.emergency_contact_name ?? "");
      setEmergencyContantPhone(profileData.emergency_contact_phone ?? "");
      setAddressLine1(profileData.address_line1 ?? "");
      setAddressLine2(profileData.address_line2 ?? "");
      setCity(profileData.city ?? "");
      setState(profileData.state ?? "");
      setCountry(profileData.country ?? "");
      setPostalCode(profileData.postal_code ?? "");
      setDisciplineId(profileData.discipline_id ?? null);
      setRankId(profileData.rank_id ?? null);
      setStartDate(toYMD(profileData.start_date ?? null));
      setCurrentRankStartDate(toYMD(profileData.current_rank_start_date ?? null));
      setNextExamDate(toYMD(profileData.next_exam_date ?? null));
      setBloodType(profileData.blood_type ?? "");
      setMedicalNotes(profileData.medical_notes ?? "");
      setNotes(profileData.notes ?? "");
    } else {
      // Si no hay profile, resetear solo los campos de perfil
      setEditingId(null);
      setName("");
      setLastName("");
      setGender("");
      setDateofBirth(null);
      setEmail("");
      setPhone("");
      setEmergencyContantName("");
      setEmergencyContantPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setCountry("");
      setPostalCode("");
      setDisciplineId(null);
      setRankId(null);
      setStartDate(null);
      setCurrentRankStartDate(null);
      setNextExamDate(null);
      setBloodType("");
      setMedicalNotes("");
      setNotes("");
    }
  }

  async function loadUserProfiles() {
    setProfile(profile ?? null);
    
    const me = await api.me();
    setUser(me.data);
    const idToUse = targetUserId ?? me.data.id;
    setMyRole(me.data.role);
    setMyId(me.data.id)
    setIdtoUse(idToUse);

    clearMsgs();
    setLoading(true);

    try {
      const dataDisciplines = await api.listDisciplines();
      const listDisciplines = Array.isArray(dataDisciplines) ? dataDisciplines : dataDisciplines?.response || dataDisciplines?.data || [];
      setDisciplines(listDisciplines);
      
      const dataRanks = await api.listRanks();
      const listRanks = Array.isArray(dataRanks) ? dataRanks : dataRanks?.response || dataRanks?.data || [];
      setRanks(listRanks);
      
      const userdata = await api.getUser(idToUse);
      const userdatalist = Array.isArray(userdata) ? userdata : userdata?.response || userdata?.data || [];
      setUserData(userdatalist);

      const userSets = await api.listUserSettings(idToUse);
      const userLang = userSets?.data.language;
      setLanguage(userLang);

      const data = await api.listUserProfiles(idToUse);
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setUserProfiles(list);
      
      const profile = Array.isArray(list) ? list[0] : list;
      setProfile(profile ?? null);

      // Cargar todos los datos del formulario en una sola llamada
      loadAllFormData(userdatalist, profile);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        return;
      }
      setError(e.message || "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUserProfiles();
  }, [targetUserId]);

  function validate() {
    if (!username.trim()) return "Username required.";
    if (!name.trim()) return "Name required.";
    if (!lastname.trim()) return "Lastname required.";
    return "";
  }

  async function save() {
    const me = await api.me();
    const idToUse = targetUserId ?? me.data.id;
    const iAmAdmin = me.data.role === "admin";

    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        lastname: lastname.trim(),
        gender: gender.trim(),
        date_of_birth: date_of_birth || null,
        email: email.trim(),
        phone: phone.trim(),
        emergency_contact_name: emergency_contact_name.trim(),
        emergency_contact_phone: emergency_contact_phone.trim(),
        address_line1: address_line1.trim(),
        address_line2: address_line2.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        postal_code: postal_code.trim(),
        discipline_id: discipline_id,
        rank_id: rank_id,
        start_date: start_date || null,
        current_rank_start_date: current_rank_start_date || null,
        next_exam_date: next_exam_date || null,
        blood_type: blood_type.trim(),
        medical_notes: medical_notes.trim(),
        notes: notes.trim(),
      }; 

      const user_payload = {
        username: username.trim(),
        name: name.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        ...(iAmAdmin && {
          role: role.trim(),
          active: active
        })
      };

      const user_settings = { lang: language };

      if (isEditing) {
        await api.updateUser(idToUse, user_payload);
        await api.updateUserProfiles(idToUse, payload);
        await api.updateUserSettingLanguage(idToUse, user_settings);
        setSuccess("User updated.");
      }

      resetForm();
      await loadUserProfiles();
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

  async function deleteUser() {
    clearMsgs();
    setLoading(true);
    try {
      await api.deleteUser(idtouse);
      setSuccess("Usuario eliminado.");
      // Redirigir a la lista de estudiantes después de eliminar
      router.push("/(app)/(main)/users");
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        return;
      }
      setError(e.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  }

  // Renderizar contenido de cada tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Login
        return (
          <View style={{ gap: 6 }}>
            {myrole === "admin" ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, paddingBottom: 16 }}>
                <Text>{t("users.active")}</Text>
                <Pressable 
                  onPress={() => !username !== "admin" && setActive(!active)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ padding: 4 }}
                >
                  <Switch 
                    disabled={username === "admin"} 
                    value={active} 
                    onValueChange={setActive}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={active ? '#3b82f6' : '#f4f3f4'}
                  />
                </Pressable>
              </View>
            ) : null}
            
            <Text style={ScreenStyles.label}>{t("login.username")}</Text>
            <TextInput 
              disabled={user?.role !== "admin"} 
              style={ScreenStyles.input} 
              value={username} 
              onChangeText={setUsername} 
              autoCapitalize="none" 
              autoCorrect={false} 
            />
              
            <Text style={ScreenStyles.label}>{t("login.password")}</Text>
            <View style={{ flexDirection: "row", gap: 10 }}> 
              <View style={{ flex: 1 }}>
                <TextInput disabled={true} style={ScreenStyles.input} placeholder="••••••••" />
              </View>
              <View style={{ maxWidth: 150, alignItems: 'flex-end' }}>
                <Pressable style={ScreenStyles.btnPrimary} onPress={() => setChangePwdVisible(true)}>
                  <Text style={ScreenStyles.btnPrimaryText}>
                    {t("common.buttons.change")}
                  </Text>
                </Pressable>
              </View>
            </View>
            
            <View style={{ flexDirection: "row", gap: 10 }}> 
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("users.role")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker disabled={user?.role !== "admin"} selectedValue={role} onValueChange={setRole}>
                    <Picker.Item label={t("users.role_user")} value="user" />
                    <Picker.Item label={t("users.role_admin")} value="admin" />
                    <Picker.Item label={t("users.role_instructor")} value="instructor" />
                  </Picker>
                </View>
              </View>
            </View>

            
          </View>
        );

      case 1: // Personal
        return (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.name")}</Text>
                <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.lastname")}</Text>
                <TextInput style={ScreenStyles.input} value={lastname} onChangeText={setLastName} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.gender")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={gender} onValueChange={setGender}>
                    <Picker.Item label={t("userprofiles.gender")} value="" />
                    <Picker.Item label={t("userprofiles.male")} value="male" />
                    <Picker.Item label={t("userprofiles.female")} value="female" />
                    <Picker.Item label={t("userprofiles.other")} value="other" />
                  </Picker>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <DatePickerField
                  label={t("userprofiles.date_of_birth")}
                  value={date_of_birth}
                  onChange={setDateofBirth}
                />
              </View>
            </View>

            <View>
              <Text style={ScreenStyles.label}>{t("common.notes")}</Text>
              <TextInput
                style={[ScreenStyles.input, { height: 100, textAlignVertical: "top" }]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        );

      case 2: // Contacto
        return (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.email")}</Text>
                <TextInput disabled={user?.role !== "admin"} style={ScreenStyles.input} value={email} onChangeText={setEmail} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.phone")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.address_line1")}</Text>
              <TextInput style={ScreenStyles.input} value={address_line1} onChangeText={setAddressLine1} />
            </View>

            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.address_line2")}</Text>
              <TextInput style={ScreenStyles.input} value={address_line2} onChangeText={setAddressLine2} />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.city")}</Text>
                <TextInput style={ScreenStyles.input} value={city} onChangeText={setCity} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.state")}</Text>
                <TextInput style={ScreenStyles.input} value={state} onChangeText={setState} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.country")}</Text>
                <TextInput style={ScreenStyles.input} value={country} onChangeText={setCountry} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.postal_code")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={postal_code}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={[ScreenStyles.label, { marginTop: 12, fontSize: 16, fontWeight: '600' }]}>
              {t("labels.emergency_contact")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.emergency_contact_name")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={emergency_contact_name}
                  onChangeText={setEmergencyContantName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.emergency_contact_phone")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={emergency_contact_phone}
                  onChangeText={setEmergencyContantPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        );

      case 3: // Marcial
        return (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.discipline")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker
                  selectedValue={discipline_id}
                  onValueChange={(v) => {
                    setDisciplineId(v);
                    // Resetear rank si cambió la disciplina
                    if (v !== discipline_id) {
                      setRankId(null);
                    }
                  }}
                >
                  <Picker.Item label={t("userprofiles.discipline")} value={null} />
                  {disciplines.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.rank")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker 
                  selectedValue={rank_id} 
                  onValueChange={(v) => setRankId(v)}
                  enabled={discipline_id !== null}
                >
                  <Picker.Item 
                    label={discipline_id ? t("userprofiles.rank") : "Selecciona disciplina primero"} 
                    value=""
                  />
                  {filteredRanks.map((r) => (
                    <Picker.Item key={r.id} label={r.name} value={r.id} />
                  ))}
                </Picker>
              </View>
              {filteredRanks.length === 0 && discipline_id && (
                <Text style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>
                  ⚠️ No hay grados configurados para esta disciplina
                </Text>
              )}
            </View>

            <View>
              <DatePickerField
                label={t("userprofiles.start_date")}
                value={start_date}
                onChange={setStartDate}
              />
            </View>

            {/* Sección de Progreso de Grado */}
            <View style={{ 
              marginTop: 16, 
              paddingTop: 16, 
              borderTopWidth: 1, 
              borderTopColor: '#e2e8f0' 
            }}>
              <Text style={[ScreenStyles.label, { fontSize: 16, fontWeight: '600', marginBottom: 12 }]}>
                📊 Progreso de Grado
              </Text>

              <View>
                <DatePickerField
                  label="Fecha de obtención del grado actual"
                  value={current_rank_start_date}
                  onChange={setCurrentRankStartDate}
                />
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Fecha en que obtuvo el grado seleccionado arriba
                </Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <DatePickerField
                  label="Fecha del próximo examen"
                  value={next_exam_date}
                  onChange={setNextExamDate}
                />
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Fecha programada para el próximo examen de grado
                </Text>
              </View>

              {rank_id && current_rank_start_date && (
                <View style={{
                  backgroundColor: '#dbeafe',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#3b82f6'
                }}>
                  <Text style={{ fontSize: 12, color: '#1e40af' }}>
                    ℹ️ El progreso del estudiante se calculará automáticamente basado en:
                  </Text>
                  <Text style={{ fontSize: 11, color: '#1e40af', marginTop: 4 }}>
                    • Tiempo desde la fecha de obtención del grado actual
                  </Text>
                  <Text style={{ fontSize: 11, color: '#1e40af' }}>
                    • Asistencias registradas desde esa fecha
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      case 4: // Médico
        return (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.blood_type")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker selectedValue={blood_type} onValueChange={setBloodType}>
                  <Picker.Item label="Selecciona tipo" value="" />
                  <Picker.Item label="O+" value="O+" />
                  <Picker.Item label="O-" value="O-" />
                  <Picker.Item label="A+" value="A+" />
                  <Picker.Item label="A-" value="A-" />
                  <Picker.Item label="B+" value="B+" />
                  <Picker.Item label="B-" value="B-" />
                  <Picker.Item label="AB+" value="AB+" />
                  <Picker.Item label="AB-" value="AB-" />
                </Picker>
              </View>
            </View>

            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.medical_notes")}</Text>
              <TextInput
                style={[ScreenStyles.input, { height: 120, textAlignVertical: "top" }]}
                value={medical_notes}
                onChangeText={setMedicalNotes}
                multiline
                numberOfLines={6}
              />
            </View>
          </View>
        );

      case 5: // Settings
        return (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={ScreenStyles.label}>{t("usersettings.language")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker selectedValue={language} onValueChange={setLanguage}>
                  <Picker.Item key="lang-en" label={t("usersettings.english")} value="en" />
                  <Picker.Item key="lang-es" label={t("usersettings.spanish")} value="es" />
                </Picker>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>
          {isMyProfile
            ? t("userprofiles.myprofile")
            : `${userprofiles?.name ?? ""} ${userprofiles?.lastname ?? ""}`.trim()
          }
        </Text>
        {/* Botón de eliminar - solo si no es mi perfil, soy admin, y no es el usuario admin */}
        {!isMyProfile && myrole === "admin" && username !== "admin" && (
        <Pressable style={{minWidth: 0, alignItems: 'center'}} onPress={askDelete}>
          <Ionicons name="trash-outline" size={18} color="#d60000" />
          <Text style={[ScreenStyles.rowMeta, { fontSize: 10 }]}>{t("common.delete")}</Text>
        </Pressable>
        )}
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingHorizontal: 8,
      }}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.id ? '#007AFF' : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#007AFF' : '#666',
            }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={ScreenStyles.center}><ActivityIndicator /></View>
        ) : (
          <View style={{ padding: 16 }}>
            {renderTabContent()}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
              <View style={{ flex: 1 }}>
                <Pressable
                  style={ScreenStyles.btnSecondary}
                  onPress={!isMyProfile ? () => router.push(`/(app)/(main)/users`) : () => router.push(`/(app)/(main)/home`)}
                  disabled={!isEditing}
                >
                  <Text style={ScreenStyles.btnSecondaryText}>{t("common.back")}</Text>
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  style={[ScreenStyles.btnPrimary, { opacity: saving ? 0.7 : 1 }]}
                  onPress={askSave}
                  disabled={saving}
                >
                  <Text style={ScreenStyles.btnPrimaryText}>
                    {saving ? t("common.saving") : t("common.save")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirm.visible}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={t("common.cancel")}
        danger={confirm.danger}
        onConfirm={doConfirm}
        onCancel={cancelConfirm}
      />

      <ChangePasswordModal
        role={myrole}
        visible={changePwdVisible}
        userId={idtouse}
        myId={myid}
        onClose={() => setChangePwdVisible(false)}
        onAuthExpired={async () => {
          await clearAuthSession();
          router.replace("/(auth)");
        }}
      />      
    </View>
  );
}