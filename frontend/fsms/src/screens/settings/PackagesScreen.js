import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";
import { Picker } from "@react-native-picker/picker";



export default function PackagesScreen({ onAuthExpired }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [chargeevery, setChargeEvery] = useState(null);
  const [chargefreq, setChargeFreq] = useState("week");
  const [fee, setFee] = useState(null);
  const [weeklimit, setWeekLimit] = useState("0");
  const [periodlimit, setPeriodLimit] = useState("0");
  const [currency, setCurrency] = useState("MXN");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setChargeEvery(null);
    setChargeFreq("week");
    setFee(null);
    setWeekLimit("");
    setPeriodLimit("");
    setCurrency("MXN");
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
    setChargeEvery(u.charge_every ?? null);
    setChargeFreq(u.charge_freq ?? "");
    setFee(u.fee ?? null);
    setWeekLimit(u.week_limit ?? "");
    setPeriodLimit(u.period_limit ?? "");
    setCurrency(u.currency ?? "");
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

  async function loadPackages() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.listPackages();
      // Soporta: [..] o {response:[..]} o {data:[..]}
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setPackages(list);

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

  useEffect(() => {
    loadPackages();
  }, []);

  function validate() {
    if (!name.trim()) return "Nombre requerido.";
    if (!chargeevery) return "Cantidad de frequencia requerida.";
    if (!chargefreq.trim()) return "Fequencia requerida.";
    if (!fee) return "Tarifa requerida.";
    if (!currency) return "Moneda requerida.";
    return "";
  }

  async function save() {
    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        charge_every: chargeevery,
        charge_freq: chargefreq.trim(),
        fee: fee,
        week_limit: weeklimit.trim(),
        period_limit: periodlimit.trim(),
        currency: currency.trim()
      };

      if (isEditing) {   

        await api.updatePackages(editingId, payload);
        setSuccess("Plan actualizada.");

      } else {

        await api.createPackages(payload);
        setSuccess("Plan creado.");

      }

      setModalVisible(false);
      await loadPackages();

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
      await api.deletePackages(id);
      setSuccess("Plan eliminado.");
      await loadPackages();
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
        <Text style={ScreenStyles.title}>{t("packages.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("packages.add_package")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadPackages} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={packages}
          refreshing={loading}
          onRefresh={loadPackages}
          keyExtractor={(u) => String(u.id)}
          renderItem={({ item }) => (
            <View style={ScreenStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowMeta}>{t("packages.title_single")}</Text>
                <Text style={ScreenStyles.rowTitle}>{item.name ?? "(sin nombre)"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowMeta}>{t("packages.charge_every")} </Text>
                <Text style={ScreenStyles.rowTitle}>{item.charge_every+ " "+t("packages."+item.charge_freq)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowMeta}>{t("packages.fee")}</Text>
                <Text style={ScreenStyles.rowTitle}>{item.fee + " " + item.currency}</Text>
              </View>
              <Pressable style={ScreenStyles.smallBtn} onPress={() => openEdit(item)}>
                <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
              </Pressable>

               <Pressable style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} onPress={() => askDelete(item.id)}>
                <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<View style={ScreenStyles.center}><Text style={{ color: "#64748b" }}>{t("packages.empty")}</Text></View>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing? t("packages.edit_package") : t("packages.add_package")}</Text>

            <Text style={ScreenStyles.label}>{t("common.name")}</Text>
            <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />
            
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("packages.charge_every")}</Text>
                <TextInput style={ScreenStyles.input} value={chargeevery} 
                  onChangeText={setChargeEvery} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("packages.period")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={chargefreq} onValueChange={setChargeFreq}>
                    <Picker.Item label={t("packages.week")} value="week" />
                    <Picker.Item label={t("packages.month")} value="month" />
                    <Picker.Item label={t("packages.class")} value="class" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("packages.fee")}</Text>
                <TextInput style={ScreenStyles.input} value={fee} 
                  onChangeText={setFee} />
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

            <View style={[ScreenStyles.rowNoWidth,{ flexDirection: "row"}]}>  
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowTitle}>{t("packages.week_limit")}</Text>
                <Text style={ScreenStyles.rowMeta}>{t("packages.week_limit_exp")}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("packages.week_limit")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={weeklimit} onValueChange={setWeekLimit}>
                    <Picker.Item label={t("packages.no_limit")} value="0" />
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.label}>{t("packages.period_limit")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                  <Picker selectedValue={periodlimit} onValueChange={setPeriodLimit}>
                    <Picker.Item label={t("packages.no_limit")} value="0" />
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
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
        title={t("packages.delete_package")}
        message={t("messages.sure_delete_package")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}