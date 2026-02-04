import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, SectionList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";
import { Picker } from "@react-native-picker/picker";
import DatePickerField from "@/src/ui/DatePickerField";
import { formatDate } from "@/src/utils/utils";


export default function MembershipsScreen({ onAuthExpired }) {

  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [user_id, setUserId] = useState(null); 
  const [package_id, setPackageId] = useState(null); 
  const [start_date, setStartDate] = useState(null); 
  const [finish_date, setFinishDate] = useState(null); 
  const [fee, setFee] = useState(""); 
  const [discounted_fee, setDiscountedFee] = useState(""); 
  const [currency, setCurrency] = useState("MXN"); 
  const [notes, setNotes] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [expandedLetters, setExpandedLetters] = useState({});
  function toggleLetter(letter) {
    setExpandedLetters((prev) => ({ ...prev, [letter]: !prev[letter] }));
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

  function userFullNameById(uId) {
    const numericId = Number(uId);
    const usr = users.find((u) => u.id === numericId);
    return `${usr?.name ?? ""} ${usr?.lastname ?? ""}`.trim();
  }

  function buildMembershipSections(list) {
    const map = new Map(); // letter -> memberships[]

    // ordena por nombre de usuario + fecha fin (opcional)
    const sorted = [...list].sort((a, b) => {
      const an = userFullNameById(a.user_id).toLowerCase();
      const bn = userFullNameById(b.user_id).toLowerCase();
      if (an !== bn) return an.localeCompare(bn);
      return String(a.finish_date ?? "").localeCompare(String(b.finish_date ?? ""));
    });

    for (const m of sorted) {
      const fullName = userFullNameById(m.user_id);
      const letter = normalizeLetter(fullName || m.user_id);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(m);
    }

    const letters = Array.from(map.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    return letters.map((letter) => ({ title: letter, data: map.get(letter) }));
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function setDefaultDates() {
    const today = new Date();

    const finish = new Date(today);
    finish.setMonth(finish.getMonth() + 12);

    setStartDate(toYMD(today));
    setFinishDate(toYMD(finish));
  }

  function findName(uId) {
    const numericId = Number(uId);
    const usr = users.find(p => p.id === numericId);
    const fname = usr?.name != null ? usr.name + " " + usr.lastname : "";
    return fname;
  }

  function findPackage(pId) {
    const numericId = Number(pId);
    const pkg = packages.find(p => p.id === numericId);
    const pname = pkg?.name != null ? pkg.name : "";
    return pname;
  }

  function toYMD(value) {
    if (!value) return "";
    // si ya viene YYYY-MM-DD
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return ""; // inválido
    return d.toISOString().slice(0, 10);
  }

  function resetForm() {
    setEditingId(null);

    setUserId(user_id ? user_id : null); 
    setPackageId(package_id ? package_id : null); 
    setStartDate(null); 
    setFinishDate(null); 
    setFee(fee ? fee : ""); 
    setDiscountedFee(fee ? fee : ""); 
    setCurrency(currency ? currency : ""); 
    setNotes("");
  }

  function openCreate() {
    clearMsgs();
    resetForm();
    setModalVisible(true);
    setDefaultDates();
  }

  function openEdit(u) {
    clearMsgs();
    setEditingId(u.id);

    setUserId(u.user_id ?? null);
    setPackageId(u.package_id ?? null);
    setStartDate(toYMD(u.start_date ?? null));
    setFinishDate(toYMD(u.finish_date ?? null));
    setFee(u.fee ?? "");
    setDiscountedFee(u.discounted_fee ?? "");
    setCurrency(u.currency ?? "");
    setNotes(u.notes ?? "");
    setModalVisible(true);
  }

  function askDelete(id) {
    setToDeleteId(id);
    setConfirmVisible(true);
  }

  function cancelDelete() {
    setConfirmVisible(false);
    setToDeleteId(null);
  }

  async function confirmDelete() {
    setConfirmVisible(false);
    await remove(toDeleteId);
    setToDeleteId(null);
  }

  async function loadMemberships() {
    clearMsgs();
    setLoading(true);
    try {

      const data = await api.listMemberships();
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setMemberships(list);

      const sections = buildMembershipSections(list);
      const first = sections[0]?.title;
      if (first) setExpandedLetters({ [first]: true });

      const userData = await api.listUsers();
      const userList = Array.isArray(userData) ? userData : userData?.response || userData?.data || [];

      setUsers(userList);
      setUserId(userList[0]?.id);

      const packagesData = await api.listPackages();
      const packagesList = Array.isArray(packagesData) ? packagesData : packagesData?.response || packagesData?.data || [];
      setPackages(packagesList);

      const firstPkg = packagesList[0] ?? null;
      setPackageId(firstPkg?.id ?? null);

      const firstFee = firstPkg?.fee != null ? String(firstPkg.fee) : "";
      setFee(firstFee);
      setDiscountedFee(firstFee);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar los paquetes.");
    } finally {
      setLoading(false);
    }
  }

  function onPackageChange(pkgId) {
    setPackageId(pkgId);
    const pkg = packages.find(p => p.id === Number(pkgId));
    const pkgFee = pkg?.fee != null ? String(pkg.fee) : "";
    setFee(pkgFee);
    setDiscountedFee(pkgFee);
  }

  useFocusEffect(
    useCallback(() => {
      loadMemberships();
    }, [])
  );

  useEffect(() => {
    loadMemberships();
  }, []);

  function validate() {
    if (!user_id) return "User required.";
    if (!package_id) return "Package required.";
    if (!start_date) return "Start Date required.";
    if (!finish_date) return "Finish Date required.";
    if (!fee) return "Fee required.";
    if (!currency) return "Currency required."
    return "";
  }

  async function save() {

    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);

    try {
      const payload = {
        user_id: user_id,
        package_id: package_id,
        start_date: start_date,
        finish_date: finish_date,
        fee: Number(fee),
        discounted_fee: discounted_fee ? Number(discounted_fee) : null,
        currency: currency.trim(),
        notes: notes.trim()
      };

      if (isEditing) {   

        await api.updateMemberships(editingId, payload);
        setSuccess("Membership updated.");

      } else {

        await api.createMemberships(payload);
        setSuccess("Membership created.");

      }

      setModalVisible(false);
      await loadMemberships();

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
      await api.deleteMemberships(id);
      setSuccess("Membership deleted.");
      await loadMemberships();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "Can't be deleted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={ScreenStyles.page}>
    <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>{t("memberships.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("memberships.add_membership")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadMemberships} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <SectionList
          sections={buildMembershipSections(memberships)}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled
          refreshing={loading}
          onRefresh={loadMemberships}
          renderSectionHeader={({ section }) => {
            const isOpen = !!expandedLetters[section.title];
            return (
              <Pressable onPress={() => toggleLetter(section.title)} style={ScreenStyles.sectionHeaderRow}>
                <Text style={ScreenStyles.sectionHeaderText}>{section.title}</Text>
                <Text style={ScreenStyles.sectionHeaderArrow}>
                  {section.data.length} {isOpen ? "▲" : "▼"}
                </Text>
              </Pressable>
            );
          }}
          renderItem={({ item, section }) => {
            if (!expandedLetters[section.title]) return null;

            return (
              <View style={[ScreenStyles.row, { minWidth: 0, width: "100%" }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={ScreenStyles.rowMeta}>{t("memberships.user_id")}</Text>
                  <Text numberOfLines={1} style={[ScreenStyles.rowTitle, { flexShrink: 1 }]}>
                    {userFullNameById(item.user_id)}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={ScreenStyles.rowMeta}>{t("memberships.package_id")}</Text>
                  <Text numberOfLines={1} style={[ScreenStyles.rowTitle, { flexShrink: 1 }]}>
                    {findPackage(item.package_id)}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={ScreenStyles.rowMeta}>{t("memberships.finish_date")}</Text>
                  <Text numberOfLines={1} style={[ScreenStyles.rowTitle, { flexShrink: 1 }]}>
                    {formatDate(item.finish_date)}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={ScreenStyles.rowMeta}>{t("memberships.fee")}</Text>
                  <Text numberOfLines={1} style={[ScreenStyles.rowTitle, { flexShrink: 1 }]}>
                    {item.fee + " " + item.currency}
                  </Text>
                </View>

                <Pressable style={ScreenStyles.smallBtn} onPress={() => openEdit(item)}>
                  <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
                </Pressable>

                <Pressable style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} onPress={() => askDelete(item.id)}>
                  <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={ScreenStyles.center}>
              <Text style={{ color: "#64748b" }}>{t("memberships.empty")}</Text>
            </View>
          }
        />

      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing? t("memberships.edit_membership") : t("memberships.add_membership")}</Text>

            {/* Users */}
            <Text style={ScreenStyles.label}>{t("memberships.user_id")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker selectedValue={user_id} onValueChange={(v) => setUserId(v)}>
                {users
                  .filter(d => d.name.trim() !== "Administrator")
                  .map(d => (
                    <Picker.Item key={d.id} label={`${d.name} ${d.lastname}`} value={d.id} />
                  ))}
              </Picker>
            </View>
           {/* Packages 
           <Picker selectedValue={package_id} onValueChange={(v) => setPackageId(v)}>
           */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("packages.title_single")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={package_id} onValueChange={onPackageChange}>
                    {packages.map((d) => (
                      <Picker.Item key={d.id} label={d.name} value={d.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              {/* Fees and Currency */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("memberships.fee")}</Text>
                <TextInput style={ScreenStyles.input} value={fee} onChangeText={setFee} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("memberships.discounted_fee")}</Text>
                <TextInput style={ScreenStyles.input} value={discounted_fee} onChangeText={setDiscountedFee} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("common.currency")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={currency} onValueChange={setCurrency}>
                    <Picker.Item label="MXN" value="MXN" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label={t("memberships.start_date")}
                  value={start_date}
                  onChange={setStartDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label={t("memberships.finish_date")}
                  value={finish_date}
                  onChange={setFinishDate}
                />
              </View>
            </View>
            <View>
              <Text style={ScreenStyles.label}>{t("memberships.notes")}</Text>
                <TextInput
                  style={[ScreenStyles.input, { height: 100, textAlignVertical: "top" }]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
            </View>
          
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable style={[ScreenStyles.btnSecondary, { flex: 1 }]} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={ScreenStyles.btnSecondaryText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable style={[ScreenStyles.btnPrimary, { flex: 1, opacity: saving ? 0.7 : 1 }]} onPress={save} disabled={saving}>
                <Text style={ScreenStyles.btnPrimaryText}>{saving ? t("common.saving") : t("common.save")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title={t("memberships.delete_membership")}
        message={t("messages.sure_delete_membership")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}