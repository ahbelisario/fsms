import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SectionList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";


export default function RanksScreen({ onAuthExpired }) {

  const [expanded, setExpanded] = useState({});
  const [Ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [disciplineId, setDisciplineId] = useState(null);

  const [disciplines, setDisciplines] = useState([]);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const sections = useMemo(() => groupByDiscipline(Ranks), [Ranks]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  function toggleSection(title) {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  function findDisciplineIdByName(disciplines, name) {
    if (!name) return null;
    const found = disciplines.find(
      (d) => String(d.name).toLowerCase() === String(name).toLowerCase()
    );
    return found ? found.id : null;
  }

  function groupByDiscipline(ranks) {
    const map = new Map();

    for (const r of ranks) {
      const key = (r.discipline ?? "Sin disciplina").toString().trim() || "Sin disciplina";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return Array.from(map.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDiscipline("");
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
    setDiscipline(u.discipline ?? "");
    const disciplineId = findDisciplineIdByName(disciplines, u.discipline);
    setDisciplineId(disciplineId);
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

  async function loadRanks() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.listRankswDiscipline();
      // Soporta: [..] o {response:[..]} o {data:[..]}
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setRanks(list);

      const dataDisciplines = await api.listDisciplines();
      // Soporta: [..] o {response:[..]} o {data:[..]}
      const listDisciplines = Array.isArray(dataDisciplines) ? dataDisciplines : dataDisciplines?.response || dataDisciplines?.data || [];
      setDisciplines(listDisciplines);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar los grados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRanks();
  }, []);

  function validate() {
    if (!name.trim()) return "Nombre requerido.";
    if (disciplineId == null) return "Disciplina requerida.";
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
        discipline: disciplineId,
      };

      if (isEditing) {   

        await api.updateRanks(editingId, payload);
        setSuccess("Grado actualizado.");

      } else {

        await api.createRanks(payload);
        setSuccess("Grado creado.");

      }

      setModalVisible(false);
      resetForm();
      await loadRanks();
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
      await api.deleteRanks(id);
      setSuccess("Grado eliminado.");
      await loadRanks();
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
        <Text style={ScreenStyles.title}>{t("ranks.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("ranks.add_rank")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadRanks} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? t("common.saving") : t("common.refresh")}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => String(item.id)}
              renderSectionHeader={({ section }) => {
                const isOpen = !!expanded[section.title];
                return (
                  <Pressable onPress={() => toggleSection(section.title)} style={ScreenStyles.sectionHeaderRow} >
                    <Text style={ScreenStyles.sectionHeaderText}>{section.title}</Text>
                    <Text style={ScreenStyles.sectionHeaderArrow}>{isOpen ? "▲" : "▼"}</Text>
                  </Pressable>
                );
              }}
              renderItem={({ item, section }) => {
                // Si está colapsada, no renderizamos items
                if (!expanded[section.title]) return null;
                return (
                  <View style={ScreenStyles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={ScreenStyles.rowTitle}>{item.name ?? "(sin nombre)"}</Text>
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
                  <Text style={{ color: "#64748b" }}>{t("ranks.empty")}</Text>
                </View>
              }
              stickySectionHeadersEnabled
            />
          )}


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing ? t("ranks.edit_rank") : t("ranks.add_rank")}</Text>

            <Text style={ScreenStyles.label}>{t("common.name")}</Text>
            <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />

            <View style={{ marginBottom: 12 }}>
                <Text style={ScreenStyles.label}>{t("disciplines.title_single")}</Text>
                <View style={ScreenStyles.pickerWrapper}>
                    <Picker selectedValue={disciplineId} onValueChange={(value) => setDisciplineId(value)}>
                      {disciplines.map((r) => (
                        <Picker.Item key={r.id} label={r.name} value={r.id} />
                        ))}
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
        title={t("ranks.delete_rank")}
        message={t("messages.sure_delete_rank")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

    </View>
  );
}