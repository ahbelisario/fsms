import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function ScoreCard({
  title,
  value,
  subtitle,
  delta,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string; // ej: "+12%" o "-3"
}) {
  const isPositive = (delta ?? "").trim().startsWith("+");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {delta ? (
          <Text style={[styles.delta, isPositive ? styles.deltaPos : styles.deltaNeg]}>
            {delta}
          </Text>
        ) : null}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: { fontSize: 12, color: "#64748b", fontWeight: "700" },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 8 },
  value: { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  delta: { fontSize: 12, fontWeight: "800" },
  deltaPos: { color: "#166534" },
  deltaNeg: { color: "#991b1b" },
  subtitle: { marginTop: 8, color: "#64748b", fontSize: 12 },
});
