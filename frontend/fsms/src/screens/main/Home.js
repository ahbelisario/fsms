import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View} from "react-native";
import { ScoreCard } from "@/src/screens/helpers/ScoreCard";
import { api } from "@/src/api/client";

export default function Home({ onAuthExpired }) {
 
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  async function loadTotals() {
    clearMsgs();
    setLoading(true);
    try {

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar el usuario.");
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
          <ScoreCard title="Horarios" value="" subtitle="Total" />
        </View>
        <View style={s.cell}>
          <ScoreCard title=" " value=" " subtitle=" " delta=" " />
        </View>
      </View>

      <View style={s.grid}>
        <View style={s.cell}>
          <ScoreCard title=" " value=" " subtitle=" " delta=" " />
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