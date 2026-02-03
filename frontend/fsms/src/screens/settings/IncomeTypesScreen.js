import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";


export default function IncomeTypesScreen({ onAuthExpired }) {
  const [incometypes, setIncomeTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
    setDescription("");
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
    setDescription(u.description ?? "");
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

  async function loadIncomeTypes() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.listIncomeTypes();
      // Soporta: [..] o {response:[..]} o {data:[..]}
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setIncomeTypes(list);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "Income types couldn't be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncomeTypes();
  }, []);

  function validate() {
    if (!name.trim()) return "Name required.";
    if (!description.trim()) return "Description required.";
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
        description: description.trim(),
      };

      if (isEditing) {   

        await api.updateIncomeTypes(editingId, payload);
        setSuccess("Income type updated.");

      } else {

        await api.createIncomeTypes(payload);
        setSuccess("Income type created.");

      }

      setModalVisible(false);
      resetForm();
      await loadIncomeTypes();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "Couldn't be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    clearMsgs();
    setLoading(true);
    try {
      await api.deleteIncomeTypes(id);
      setSuccess("Income type deleted.");
      await loadIncomeTypes();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "Couldn't be deleted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={ScreenStyles.page}>
    <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>{t("incometypes.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("incometypes.add_incometype")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadIncomeTypes} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.loading") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={incometypes}
          refreshing={loading}
          onRefresh={loadIncomeTypes}
          keyExtractor={(u) => String(u.id)}
          renderItem={({ item }) => (
            <View style={ScreenStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowTitle}>{item.name ?? "(sin nombre)"}</Text>
                <Text style={ScreenStyles.rowMeta}>{t("common.description")}{`: ${item.description ?? ""}`}</Text>
              </View>

              <Pressable style={ScreenStyles.smallBtn} onPress={() => openEdit(item)}>
                <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
              </Pressable>

               <Pressable style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} onPress={() => askDelete(item.id)}>
                <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<View style={ScreenStyles.center}><Text style={{ color: "#64748b" }}>{t("incometypes.empty")}</Text></View>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing? t("incometypes.edit_incometype") : t("incometypes.add_incometype")}</Text>

            <Text style={ScreenStyles.label}>{t("common.name")}</Text>
            <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />

            <Text style={ScreenStyles.label}>{t("common.description")}</Text>
            <TextInput multiline style={ScreenStyles.textArea} value={description} onChangeText={setDescription} />

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
        title={t("incometypes.delete_incometype")}
        message={t("messages.sure_delete_incometype")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}