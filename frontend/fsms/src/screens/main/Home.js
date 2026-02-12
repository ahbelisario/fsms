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
  const [lastpayment, setLastPayment] = useState([]);
  
  const isEditing = useMemo(() => editingId !== null, [editingId]);
  
  function toYMD(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  async function loadTotals() {

    const me = await api.me();
    const datalastpayment = await api.reportsLastPaymentbyUser(me.data.id);
    const listlastpayment = Array.isArray(datalastpayment) ? datalastpayment : datalastpayment?.response || datalastpayment?.data || [];
    setLastPayment(listlastpayment);

    console.log(lastpayment);

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
          <ScoreCard title={"Last payment on " + toYMD(lastpayment[0]?.income_date)}  value={String(lastpayment[0]?.amount) + " " + lastpayment[0]?.currency} subtitle="Total" />
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