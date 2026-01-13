import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View, Switch} from "react-native";
import { api } from "../api/client";
import { ScreenStyles } from '../styles/appStyles';

export default function DiciplinesScreen({ onAuthExpired }) {
  const [Diciplines, setDiciplines] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

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

  async function loadDiciplines() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.listDiciplines();
      // Soporta: [..] o {response:[..]} o {data:[..]}
      const list = Array.isArray(data) ? data : data?.response || data?.data || [];
      setDiciplines(list);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar las diciplinas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDiciplines();
  }, []);

  function validate() {
    if (!name.trim()) return "Nombre requerido.";
    if (!description.trim()) return "Descripción requerida.";
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

        await api.updateDiciplines(editingId, payload);
        setSuccess("Diciplina actualizada.");

      } else {

        await api.createDiciplines(payload);
        setSuccess("Diciplina creada.");

      }

      setModalVisible(false);
      resetForm();
      await loadDiciplines();
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
      await api.deleteDiciplines(id);
      setSuccess("Diciplina eliminada.");
      await loadDiciplines();
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
        <Text style={ScreenStyles.title}>Diciplinas</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={openCreate}>
          <Text style={ScreenStyles.btnPrimaryText}>Agregar Diciplina</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={loadDiciplines} disabled={loading}>
        <Text style={ScreenStyles.btnSecondaryText}>{loading ? "Cargando..." : "Refrescar"}</Text>
      </Pressable>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={Diciplines}
          keyExtractor={(u) => String(u.id)}
          renderItem={({ item }) => (
            <View style={ScreenStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={ScreenStyles.rowTitle}>{item.name ?? "(sin nombre)"}</Text>
                <Text style={ScreenStyles.rowMeta}>{`Descripción: ${item.description ?? ""}`}</Text>
              </View>

              <Pressable style={ScreenStyles.smallBtn} onPress={() => openEdit(item)}>
                <Text style={ScreenStyles.smallBtnText}>Editar</Text>
              </Pressable>

               <Pressable style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} onPress={() => remove(item.id)}>
                <Text style={ScreenStyles.smallBtnText}>Borrar</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<View style={ScreenStyles.center}><Text style={{ color: "#64748b" }}>No hay Diciplinas.</Text></View>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{isEditing ? "Editar" : "Crear"} usuario</Text>

            <Text style={ScreenStyles.label}>Nombre</Text>
            <TextInput style={ScreenStyles.input} value={name} onChangeText={setName} />

            <Text style={ScreenStyles.label}>Descripción</Text>
            <TextInput multiline style={ScreenStyles.textArea} value={description} onChangeText={setDescription} />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable style={[ScreenStyles.btnSecondary, { flex: 1 }]} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={ScreenStyles.btnSecondaryText}>Cancelar</Text>
              </Pressable>

              <Pressable style={[ScreenStyles.btnPrimary, { flex: 1, opacity: saving ? 0.7 : 1 }]} onPress={save} disabled={saving}>
                <Text style={ScreenStyles.btnPrimaryText}>{saving ? "Guardando..." : "Guardar"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}