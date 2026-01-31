import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View} from "react-native";
import { ScoreCard } from "../screens/ScoreCard";
import { api } from "../api/client";
import { t } from "@/src/i18n";

export default function Dashboard({ onAuthExpired }) {
  const [totalusers, setUsers] = useState([]);
  const [totaldisciplines, setDisciplines] = useState([]);
  const [totalranks, setRanks] = useState([]);
  const [totalpackages, setPackages] = useState([]);
  const [totalmemberships, setMemberships] = useState([]);

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
      setUsers(Number(dataUsers?.total_rows ?? 0));

      const dataRanks = await api.listRanks();
      setRanks(Number(dataRanks?.total_rows ?? 0));

      const dataDisciplines = await api.listDisciplines();
      setDisciplines(Number(dataDisciplines?.total_rows ?? 0));

      const dataPackages = await api.listPackages();
      setPackages(Number(dataPackages?.total_rows ?? 0));

      const dataMemberships = await api.listMemberships();
      setMemberships(Number(dataMemberships?.total_rows ?? 0));

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

  useFocusEffect(
      useCallback(() => {
        loadTotals();
      }, [])
    );

  useEffect(() => {
    loadTotals();
  }, []);

  return (
    <View style={s.container}>
      <View style={s.grid}>
        <View style={s.cell}>
          <ScoreCard title={t("memberships.title")} value={totalmemberships ? totalmemberships : "0"} subtitle="Total" />
        </View>
        <View style={s.cell}>
          <ScoreCard title=" " value=" " subtitle=" " />
        </View>
      </View>
      <View style={s.grid}>
        <View style={s.cell}>
          <ScoreCard title={t("users.title")} value={totalusers ? totalusers : "0"} subtitle="Total" />
        </View>
        <View style={s.cell}>
          <ScoreCard title={t("disciplines.title")} value={totaldisciplines ? totaldisciplines : "0"} subtitle="Total" />
        </View>
      </View>
      <View style={s.grid}>
        <View style={s.cell}>
          <ScoreCard title={t("ranks.title")} value={totalranks ? totalranks : "0"} subtitle="Total" />
        </View>
        <View style={s.cell}>
          <ScoreCard title={t("packages.title")} value={totalpackages ? totalpackages : "0"} subtitle="Total" />
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