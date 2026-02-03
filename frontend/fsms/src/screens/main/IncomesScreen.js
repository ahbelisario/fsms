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


export default function IncomesScreen({ onAuthExpired }) {

  const [incomes, setIncomes] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [income_types, setIncomeTypes] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [description, setDescription] = useState("");
  const [membership_id, setMembershipId] = useState(null); 
  const [user_id, setUserId] = useState(null); 
  const [income_date, setIncomeDate] = useState(null); 
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [incomemethod, setIncomeMethod] = useState("cash"); 
  const [reference, setReference] = useState(""); 
  const [status, setStatus] = useState("applied"); 
  const [income_type_id, setIncomeTypeId] = useState(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [expandedYears, setExpandedYears] = useState({});   // { "2025": true/false }
  const [expandedMonths, setExpandedMonths] = useState({}); // { "2025-07": true/false }

  function toggleYear(year) {
    const y = String(year);
    setExpandedYears(prev => ({ ...prev, [y]: !prev[y] }));
  }

  function toggleMonth(year, monthIndex) {
    const m = String(monthIndex + 1).padStart(2, "0");
    const key = `${year}-${m}`;
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  }


  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function setDefaultDates() {
    const today = new Date();

    const finish = new Date(today);
    finish.setMonth(finish.getMonth() + 12);

    setIncomeDate(toYMD(today));
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

  function findMembership(pId) {
    const numericId = Number(pId);
    const pkg = memberships.find(p => p.id === numericId);
    const pkgId = pkg?.package_id != null ? pkg.package_id : "";
    return findPackage(pkgId);
  }

  function setIncomeUserIdMembership(uId,mId) {
    setUserId(uId);
    setMembershipId(mId);
  }

  function onMembershipChange(membershipId) {
    const id = Number(membershipId); // por si viene como string
    setMembershipId(id);

    const m = memberships.find(x => x.id === id);
    if (!m) return;

    setIncomeUserIdMembership(m.user_id, m.id); // o setIncomeUserId(m.user_id) + setMembershipId(m.id)
  }

  function toYMD(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}[T\s]/.test(value)) {
      return value.slice(0, 10);
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function toDMY(v) {
    if (!v) return "";
    // v viene como "2025-07-01T00:00:00.000Z"
    const ymd = String(v).slice(0, 10); // "2025-07-01"
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`; // "01/07/2025"
  }

  function resetForm() {
    setEditingId(null);
    setDescription(""); 
    setUserId(user_id ? user_id : null); 
    setMembershipId(membership_id ? membership_id : null);
    setIncomeDate(null); 
    setAmount("");
    setIncomeMethod(incomemethod ? incomemethod : ""); 
    setReference(reference ? reference : ""); 
    setStatus(status ? status : ""); 
    setIncomeTypeId(income_type_id ? income_type_id : 1);

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
    
    setDescription(u.description ?? ""); 
    setUserId(u.user_id ?? null);
    setMembershipId(u.membership_id ?? null);

    setIncomeDate(toYMD(u.income_date ?? null));
    setAmount(u.amount ?? "");
    setIncomeMethod(u.income_method ?? ""); 
    setReference(u.reference ?? ""); 
    setStatus(u.status ?? ""); 
    setIncomeTypeId(u.income_type_id ?? null);

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

  const MONTHS_ES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  function ymdFromApi(v) {
    if (!v) return "";
    return String(v).slice(0, 10); // "YYYY-MM-DD" (evita TZ)
  }

  function dmyFromApi(v) {
    const ymd = ymdFromApi(v);
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  }

  function buildYearMonthSections(incomes) {
    // Orden: más reciente primero
    const sorted = [...incomes].sort((a, b) => {
      const da = ymdFromApi(a.income_date);
      const db = ymdFromApi(b.income_date);
      // string compare funciona para YYYY-MM-DD
      return db.localeCompare(da);
    });

    // year -> monthIndex(0-11) -> items[]
    const map = new Map();

    for (const p of sorted) {
      const ymd = ymdFromApi(p.income_date);
      if (!ymd) continue;
      const year = ymd.slice(0, 4);
      const month = Number(ymd.slice(5, 7)) - 1;

      if (!map.has(year)) map.set(year, new Map());
      const monthsMap = map.get(year);

      if (!monthsMap.has(month)) monthsMap.set(month, []);
      monthsMap.get(month).push(p);
    }

    // Construye sections: [{ title: "2025", data: [{month: 6, items:[...]} ...] }]
    const years = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

    return years.map((year) => {
      const monthsMap = map.get(year);
      const months = Array.from(monthsMap.keys()).sort((a, b) => b - a); // desc

      const data = months.map((month) => ({
        month,
        items: monthsMap.get(month),
      }));

      return { title: year, year, data };
    });
  }


  async function loadIncomes() {
    clearMsgs();
    setLoading(true);
    try {

      
      const data = await api.listIncomes();
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setIncomes(list);

      const dataIncomeTypes = await api.listIncomeTypes();
      const listIncomeTypes = Array.isArray(dataIncomeTypes) ? dataIncomeTypes : dataIncomeTypes?.response || dataIncomeTypes?.data || [];
      setIncomeTypes(listIncomeTypes);

      const sections = buildYearMonthSections(list);
      const firstYear = sections[0]?.title;
      if (firstYear) setExpandedYears({ [firstYear]: true });

      const userData = await api.listUsers();
      const userList = Array.isArray(userData) ? userData : userData?.response || userData?.data || [];

      setUsers(userList);
      setUserId(userList[0]?.id);

      const membershipsData = await api.listMemberships();
      const membershipsList = Array.isArray(membershipsData) ? membershipsData : membershipsData?.response || membershipsData?.data || [];
      setMemberships(membershipsList);

      const packagesData = await api.listPackages();
      const packagesList = Array.isArray(packagesData) ? packagesData : packagesData?.response || packagesData?.data || [];
      setPackages(packagesList);

      const firstPkg = membershipsList[0] ?? null;
      setMembershipId(firstPkg?.id ?? null);

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

  useFocusEffect(
    useCallback(() => {
      loadIncomes();
    }, [])
  );

  function validate() {
    if (!income_date) return "Income Date required.";
    if (!amount) return "Amount required.";
    if (!currency) return "Currency required.";
    if (!income_type_id) return "Type required.";
    return "";
  }

  async function save() {

    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    const me = await api.me();

    setSaving(true);

    try {
      const payload = {
        description: description.trim(),
        membership_id: membership_id,
        user_id: user_id,
        income_date: income_date,
        amount: Number(amount),
        currency: currency.trim(),
        income_method: incomemethod.trim(), 
        reference: reference.trim(),
        status: status.trim(), 
        income_type: income_type_id,
        created_by: me.data.id
      };

      console.log(payload);

      if (isEditing) {   

        await api.updateIncomes(editingId, payload);
        setSuccess("Income updated.");

      } else {

        await api.createIncomes(payload);
        setSuccess("Income created.");

      }

      setModalVisible(false);
      await loadIncomes();

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
      await api.deleteIncomes(id);
      setSuccess("Income deleted.");
      await loadIncomes();
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
        <Text style={ScreenStyles.title}>{t("incomes.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("incomes.add_income")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadIncomes} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <SectionList
          sections={buildYearMonthSections(incomes)}
          keyExtractor={(row) => `month-${row.month}`} // cada row = {month, items}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => {
          const isOpen = !!expandedYears[section.title];
          return (
            <Pressable onPress={() => toggleYear(section.title)} style={ScreenStyles.sectionHeaderRow}>
              <Text style={ScreenStyles.sectionHeaderText}>{section.title}</Text>
              <Text style={ScreenStyles.sectionHeaderArrow}>{isOpen ? "▲" : "▼"}</Text>
            </Pressable>
          );
        }}

          renderItem={({ item, section }) => {
            // item = { month, items: [...] }
            if (!expandedYears[section.title]) return null; // año colapsado

            const monthLabel = MONTHS_ES[item.month];
            const monthKey = `${section.title}-${String(item.month + 1).padStart(2, "0")}`;
            const isMonthOpen = !!expandedMonths[monthKey];

            return (
              <View>
                {/* Header del mes con mismo look que section header */}
                <Pressable
                  onPress={() => toggleMonth(section.title, item.month)}
                  style={ScreenStyles.monthHeaderRow}
                >
                  <Text style={ScreenStyles.sectionHeaderText}>{monthLabel}</Text>
                  <Text style={ScreenStyles.sectionHeaderArrow}>{t("incomes.title") + ": "+ item.items.length+ " "} {isMonthOpen ? "▲" : "▼"}</Text>
                </Pressable>

                {/* Items del mes (solo si mes abierto) */}
                {isMonthOpen && item.items.map((pay) => (
                  <View key={pay.id} style={ScreenStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("incomes.income_date")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{dmyFromApi(pay.income_date)}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{pay.user_id ? t("incomes.user_id") : t("common.description")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{pay.user_id ? findName(pay.user_id) : pay.description}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("incomes.amount")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{pay.amount + " " + pay.currency}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("incomes.status")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{t("incomes." + pay.status)}</Text>
                    </View>

                    <Pressable style={ScreenStyles.smallBtn} onPress={() => openEdit(pay)}>
                      <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
                    </Pressable>

                    <Pressable
                      style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]}
                      onPress={() => askDelete(pay.id)}
                    >
                      <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            );
          }}

          ListEmptyComponent={
            <View style={ScreenStyles.center}>
              <Text style={{ color: "#64748b" }}>{t("incomes.empty")}</Text>
            </View>
          }
        />
      )}


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing? t("incomes.edit_income") : t("incomes.add_income")}</Text>

            {/* Users 
            <Text style={ScreenStyles.label}>{t("incomes.user_id")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker selectedValue={user_id} onValueChange={(v) => setUserId(v)}>
                {users
                  .filter(d => d.name.trim() !== "Administrator")
                  .map(d => (
                    <Picker.Item key={d.id} label={`${d.name} ${d.lastname}`} value={d.id} />
                  ))}
              </Picker>
            </View>*/}
           {/* Memberships 
           <Picker selectedValue={membership_id} onValueChange={(v) => setMembershipId(v)}>
           */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("incomes.type")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={income_type_id} onValueChange={setIncomeTypeId}>
                    {income_types.map((d) => (
                      <Picker.Item key={d.id} label={d.name} value={d.id} />
                    ))}
                  </Picker>
                </View>
              </View> 
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("memberships.title")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={membership_id} onValueChange={onMembershipChange}>
                      <Picker.Item label="N/A" value="" />
                    {memberships.map((d) => (
                      <Picker.Item key={d.id} label={findName(d.user_id)+ " - " +findMembership(d.id)} value={d.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("common.description")}</Text>
                <TextInput style={ScreenStyles.input} value={description} onChangeText={setDescription} />
              </View>
            </View>
              {/* Fees and Currency */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("incomes.amount")}</Text>
                <TextInput style={ScreenStyles.input} value={amount} onChangeText={setAmount} />
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
                <Text style={ScreenStyles.label}>{t("incomes.income_method")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={incomemethod} onValueChange={setIncomeMethod}>
                    <Picker.Item label={t("incomes.cash")} value="cash" />
                    <Picker.Item label={t("incomes.transfer")}value="transfer" />
                    <Picker.Item label={t("incomes.card")} value="card" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label={t("incomes.income_date")}
                  value={income_date}
                  onChange={(v) => setIncomeDate(toYMD(v))}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("incomes.reference")}</Text>
                <TextInput style={ScreenStyles.input} value={reference} onChangeText={setReference} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("incomes.status")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={status} onValueChange={setStatus}>
                    <Picker.Item label={t("incomes.applied")} value="applied" />
                    <Picker.Item label={t("incomes.pending")} value="pending" />
                  </Picker>
                </View>
              </View>      
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
        title={t("incomes.delete_membership")}
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