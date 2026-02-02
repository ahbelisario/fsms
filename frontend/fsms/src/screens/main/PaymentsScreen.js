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


export default function PaymentsScreen({ onAuthExpired }) {

  const [payments, setPayments] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [membership_id, setMembershipId] = useState(null); 
  const [user_id, setUserId] = useState(null); 
  const [payment_date, setPaymentDate] = useState(null); 
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [paymentmethod, setPaymentMethod] = useState("cash"); 
  const [reference, setReference] = useState(""); 
  const [status, setStatus] = useState("applied"); 
  const [type, setType] = useState("payment");

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

    setPaymentDate(toYMD(today));
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

  function setPaymentUserIdMembership(uId,mId) {
    setUserId(uId);
    setMembershipId(mId);
  }

  function onMembershipChange(membershipId) {
    const id = Number(membershipId); // por si viene como string
    setMembershipId(id);

    const m = memberships.find(x => x.id === id);
    if (!m) return;

    setPaymentUserIdMembership(m.user_id, m.id); // o setPaymentUserId(m.user_id) + setMembershipId(m.id)
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

    setUserId(user_id ? user_id : null); 
    setMembershipId(membership_id ? membership_id : null);
    setPaymentDate(null); 
    setAmount("");
    setPaymentMethod(paymentmethod ? paymentmethod : ""); 
    setReference(reference ? reference : ""); 
    setStatus(status ? status : ""); 
    setType(type ? type : "");

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
    setMembershipId(u.membership_id ?? null);

    setPaymentDate(toYMD(u.payment_date ?? null));
    setAmount(u.amount ?? "");
    setPaymentMethod(u.payment_method ?? ""); 
    setReference(u.reference ?? ""); 
    setStatus(u.status ?? ""); 
    setType(u.type ?? "");

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

  function buildYearMonthSections(payments) {
    // Orden: más reciente primero
    const sorted = [...payments].sort((a, b) => {
      const da = ymdFromApi(a.payment_date);
      const db = ymdFromApi(b.payment_date);
      // string compare funciona para YYYY-MM-DD
      return db.localeCompare(da);
    });

    // year -> monthIndex(0-11) -> items[]
    const map = new Map();

    for (const p of sorted) {
      const ymd = ymdFromApi(p.payment_date);
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


  async function loadPayments() {
    clearMsgs();
    setLoading(true);
    try {

      
      const data = await api.listPayments();
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setPayments(list);

      const sections = buildYearMonthSections(list);
      const firstYear = sections[0]?.title;
      if (firstYear) setExpandedYears({ [firstYear]: true });


      console.log(list);

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
      loadPayments();
    }, [])
  );

  function validate() {
    if (!user_id) return "User required.";
    if (!membership_id) return "Membership required.";
    if (!payment_date) return "Payment Date required.";
    if (!amount) return "Amount required.";
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
        membership_id: membership_id,
        user_id: user_id,
        payment_date: payment_date,
        amount: Number(amount),
        currency: currency.trim(),
        payment_method: paymentmethod.trim(), 
        reference: reference.trim(),
        status: status.trim(), 
        type: type.trim(),
        created_by: me.data.id
      };

      if (isEditing) {   

        await api.updatePayments(editingId, payload);
        setSuccess("Payment updated.");

      } else {

        await api.createPayments(payload);
        setSuccess("Payment created.");

      }

      setModalVisible(false);
      await loadPayments();

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
      await api.deletePayments(id);
      setSuccess("Payment deleted.");
      await loadPayments();
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
        <View style={{ flexDirection: "row", width: "100%", justifyContent: "flex-end" }}>
          <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
            <Text style={ScreenStyles.btnPrimaryText}>{t("payments.add_payment")}</Text>
          </Pressable>
        </View>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadPayments} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <SectionList
          sections={buildYearMonthSections(payments)}
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
                  <Text style={ScreenStyles.sectionHeaderArrow}>{item.items.length} {isMonthOpen ? "▲" : "▼"}</Text>
                </Pressable>

                {/* Items del mes (solo si mes abierto) */}
                {isMonthOpen && item.items.map((pay) => (
                  <View key={pay.id} style={ScreenStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("payments.payment_date")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{dmyFromApi(pay.payment_date)}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("payments.user_id")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{findName(pay.user_id)}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("payments.amount")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{pay.amount + " " + pay.currency}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowMeta}>{t("payments.status")}</Text>
                      <Text style={ScreenStyles.rowTitle}>{t("payments." + pay.status)}</Text>
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
              <Text style={{ color: "#64748b" }}>{t("payments.empty")}</Text>
            </View>
          }
        />
      )}


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing? t("payments.edit_payment") : t("payments.add_payment")}</Text>

            {/* Users 
            <Text style={ScreenStyles.label}>{t("payments.user_id")}</Text>
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
                <Text style={ScreenStyles.label}>{t("memberships.title")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={membership_id} onValueChange={onMembershipChange}>
                    {memberships.map((d) => (
                      <Picker.Item key={d.id} label={findName(d.user_id)+ " - " +findMembership(d.id)} value={d.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              {/* Fees and Currency */}
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("payments.amount")}</Text>
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
            <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("payments.payment_method")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={paymentmethod} onValueChange={setPaymentMethod}>
                    <Picker.Item label={t("payments.cash")} value="cash" />
                    <Picker.Item label={t("payments.transfer")}value="transfer" />
                    <Picker.Item label={t("payments.card")} value="card" />
                  </Picker>
                </View>
              </View>  
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("payments.payment_date")}</Text>
                <DatePickerField
                  label={t("payments.payment_date")}
                  value={payment_date}
                  onChange={(v) => setPaymentDate(toYMD(v))}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ScreenStyles.label}>{t("payments.reference")}</Text>
              <TextInput style={ScreenStyles.input} value={reference} onChangeText={setReference} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("payments.status")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={status} onValueChange={setStatus}>
                    <Picker.Item label={t("payments.applied")} value="applied" />
                    <Picker.Item label={t("payments.pending")} value="pending" />
                  </Picker>
                </View>
              </View>            
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("payments.type")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={type} onValueChange={setType}>
                    <Picker.Item label={t("payments.payment")} value="payment" />
                    <Picker.Item label={t("payments.adjustment")} value="adjustment" />
                    <Picker.Item label={t("payments.surcharge")} value="surcharge" />
                  </Picker>
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
        title={t("payments.delete_membership")}
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