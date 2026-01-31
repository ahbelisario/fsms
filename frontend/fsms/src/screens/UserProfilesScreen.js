import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ScrollView, RefreshControl } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "../api/client";
import { ScreenStyles } from '../styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import DatePickerField from "@/src/ui/DatePickerField";
import { t } from "@/src/i18n";

export default function UserProfilesScreen({ onAuthExpired, targetUserId }) {

  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [ranks, setRanks] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  
  const [user, setUser] = useState({});
  const [userprofiles, setUserProfiles] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
  const [rank_id, setRankId] = useState(null);
  const [start_date, setStartDate] = useState(null);
  const [blood_type, setBloodType] = useState("");
  const [medical_notes, setMedicalNotes] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const isMyProfile = userprofiles && user && Number(userprofiles.user_id) === Number(user.id);
  
  const [confirm, setConfirm] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: t("common.confirm"),
    danger: false,
    action: null,
  });

  function toYMD(value) {
    if (!value) return "";
    // si ya viene YYYY-MM-DD
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return ""; // inválido
    return d.toISOString().slice(0, 10);
  }

  useFocusEffect(
    useCallback(() => {
      loadUserProfiles(); //
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
        await save(); // tu función real
      },
    });
  }

  function cancelConfirm() {
    setConfirm((c) => ({ ...c, visible: false, action: null }));
  }

  async function doConfirm() {
    const action = confirm.action;
    cancelConfirm(); // cierra primero (UX mejor)
    if (action) await action();
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
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
    setBloodType("");
    setMedicalNotes("");
    setEditingId(null);
  }

  function openEdit(u) {
    clearMsgs();
    setEditingId(u.id);

    setName(u.name ?? "");
    setLastName(u.lastname ?? "");
    setGender(u.gender ?? "");
    setDateofBirth(toYMD(u.date_of_birth ?? null));
    setEmail(u.email ?? "");
    setPhone(u.phone ?? "");
    setEmergencyContantName(u.emergency_contact_name ?? "");
    setEmergencyContantPhone(u.emergency_contact_phone ?? "");
    setAddressLine1(u.address_line1 ?? "");
    setAddressLine2(u.address_line2 ?? "");
    setCity(u.city ?? "");
    setState(u.state ?? "");
    setCountry(u.country ?? "");
    setPostalCode(u.postal_code ?? "");
    setDisciplineId(u.discipline_id ?? null);
    setRankId(u.rank_id ?? null);
    setStartDate(toYMD(u.start_date ?? null));
    setBloodType(u.blood_type ?? "");
    setMedicalNotes(u.medical_notes ?? "");
  }

  async function loadUserProfiles() {

    setProfile(profile ?? null);

    const me = await api.me();
    setUser(me.data);

    const idToUse = targetUserId ?? me.data.id;

    clearMsgs();
    setLoading(true);
    try {

      const dataDisciplines = await api.listDisciplines();
      const listDisciplines = Array.isArray(dataDisciplines) ? dataDisciplines : dataDisciplines?.response || dataDisciplines?.data || [];
      setDisciplines(listDisciplines);
      
      const dataRanks = await api.listRanks();
      const listRanks = Array.isArray(dataRanks) ? dataRanks : dataRanks?.response || dataRanks?.data || [];
      setRanks(listRanks);
      
      const data = await api.listUserProfiles(idToUse);

      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setUserProfiles(list);
      
      const profile = Array.isArray(list) ? list[0] : list;
      setProfile(profile ?? null);

      if (profile) openEdit(profile);
        else resetForm();

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
    if (!name.trim()) return "Nombre requerido.";
    if (!lastname.trim()) return "Apellido requerido.";
    return "";
  }

  async function save() {

    const me = await api.me();
    const idToUse = targetUserId ?? me.data.id;
    

    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {

      const payload = {
        name: name.trim(),
        lastname: lastname.trim(),
        gender: gender.trim(),
        date_of_birth: date_of_birth,
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
        start_date: start_date,
        blood_type: blood_type.trim(),
        medical_notes: medical_notes.trim(),
      };

      if (isEditing) {

        await api.updateUserProfiles(idToUse, payload);
        setSuccess("Perfil actualizado.");

       // if (!isMyProfile) { router.push(`/(app)/users`); } else { router.push(`/(app)/home`); }

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


  return (
    
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>
        {isMyProfile
          ? t("userprofiles.myprofile")
          : `${userprofiles?.name ?? ""} ${userprofiles?.lastname ?? ""}`.trim()
        }
      </Text>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}
     
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
         <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Nombre */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.name")}</Text>
                <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />
              </View>
              {/* Apellido */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.lastname")}</Text>
                <TextInput style={ScreenStyles.input} value={lastname} onChangeText={setLastName} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Género */}
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

              {/* Fecha de nacimiento */}
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label={t("userprofiles.date_of_birth")}
                  value={date_of_birth}
                  onChange={setDateofBirth}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Teléfono */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.phone")}</Text>
                <TextInput
                  style={ScreenStyles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              {/* Correo Electronico */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.email")}</Text>
                <TextInput style={ScreenStyles.input} value={email} onChangeText={setEmail} />
              </View>
            </View>

            {/* Dirección */}
            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.address_line1")}</Text>
              <TextInput style={ScreenStyles.input} value={address_line1} onChangeText={setAddressLine1} />
            </View>

            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.address_line2")}</Text>
              <TextInput style={ScreenStyles.input} value={address_line2} onChangeText={setAddressLine2} />
            </View>

            {/* Ciudad / Estado */}
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

            {/* País / Código postal */}
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

            <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Disciplina */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.discipline")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker
                    selectedValue={discipline_id}
                    onValueChange={(v) => setDisciplineId(v)}
                  >
                    <Picker.Item label={t("userprofiles.discipline")} value={null} />
                    {disciplines.map((d) => (
                      <Picker.Item key={d.id} label={d.name} value={d.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Grado */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("userprofiles.rank")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={rank_id} onValueChange={(v) => setRankId(v)}>
                    <Picker.Item label={t("userprofiles.rank")} value={null} />
                    {ranks.map((r) => (
                      <Picker.Item key={r.id} label={r.name} value={r.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Fecha de inicio */}
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label={t("userprofiles.start_date")}
                  value={start_date}
                  onChange={setStartDate}
                />
              </View>
            </View>

            {/* Tipo de sangre */}
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

            {/* Notas médicas */}
            <View>
              <Text style={ScreenStyles.label}>{t("userprofiles.medical_notes")}</Text>
              <TextInput
                style={[ScreenStyles.input, { height: 100, textAlignVertical: "top" }]}
                value={medical_notes}
                onChangeText={setMedicalNotes}
                multiline
                numberOfLines={4}
              />
            </View>

             {/* Contacto de emergencia */}
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

            {/* <Pressable style={ScreenStyles.btnSecondary} onPress={onRefresh} disabled={!isEditing}> 
             <Pressable style={ScreenStyles.btnSecondary} onPress={!isMyProfile ? () => router.push(`/(app)/users`) : () => router.push(`/(app)/home`)} disabled={!isEditing}>
            */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Pressable style={ScreenStyles.btnSecondary} onPress={router.back} disabled={!isEditing}>
                  <Text style={ScreenStyles.btnSecondaryText}>{t("common.back")}</Text>
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>         
                <Pressable style={[ScreenStyles.btnPrimary, { opacity: saving ? 0.7 : 1 }]} onPress={askSave} disabled={saving}>
                  <Text style={ScreenStyles.btnPrimaryText}>{saving ? t("common.saving") : t("common.save")}</Text>
                </Pressable>
              </View>         
            </View>

          </View>

      )}

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

      </ScrollView>

    </View>
  );
}