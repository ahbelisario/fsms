import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View} from "react-native";
import { ScoreCard } from "../screens/ScoreCard";
import { api } from "../api/client";
import { i18n, t } from "@/src/i18n";

export default function Dashboard({ onAuthExpired }) {
  const [totalusers, setUsers] = useState([]);
  const [totaldiciplines, setDiciplines] = useState([]);
  const [totalranks, setRanks] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const ROLE_LABELS = { admin: "Administrador", user: "Usuario" };

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  async function loadTotals() {
    clearMsgs();
    setLoading(true);
    try {

      const dataUsers = await api.listUsers();
      const totalUsers = Array.isArray(dataUsers) ? dataUsers : dataUsers?.response || dataUsers?.total_rows || [];
      setUsers(totalUsers);

      const dataRanks = await api.listRanks();
      const totalRanks = Array.isArray(dataRanks) ? dataRanks : dataRanks?.response || dataRanks?.total_rows || [];
      setRanks(totalRanks);

      const dataDiciplines = await api.listDiciplines();
      const totalDiciplines = Array.isArray(dataDiciplines) ? dataDiciplines : dataDiciplines?.response || dataDiciplines?.total_rows || [];
      setDiciplines(totalDiciplines);

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
    loadTotals();
  }, []);

  return (
    <View style={s.container}>
      <View style={s.grid}>
        <View style={s.cell}>
          <ScoreCard title={t("users.title")} value={totalusers} subtitle="Total" />
        </View>
        <View style={s.cell}>
          <ScoreCard title={t("disciplines.title")} value={totaldiciplines} subtitle="Total" delta="+12%" />
        </View>
      </View>

      <View style={s.grid}>
        <View style={s.cell}>
          <ScoreCard title={t("ranks.title")} value={totalranks} subtitle="Total" />
        </View>
        <View style={s.cell}>
          <ScoreCard title=" " value=" " subtitle=" " delta=" " />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  grid: { flexDirection: "row", gap: 12 },
  cell: { flex: 1 },
});