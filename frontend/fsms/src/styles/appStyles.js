import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.00)", alignItems: "center", justifyContent: "center", padding: 24, },
  card: { width: "100%", maxWidth: 420, backgroundColor: "white", borderRadius: 14, padding: 24, borderWidth: 1, borderColor: "#cbd5e1" },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { marginTop: 6, marginBottom: 18, color: "#475569" },

  label: { fontSize: 14, marginBottom: 6, color: "#0f172a" },
  input: { width: "100%", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#cbd5e1", fontSize: 14, marginBottom: 14, },

  passwordRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 14 },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#f8fafc", },
  toggleBtnText: { fontSize: 13 },

  submitBtn: { paddingVertical: 12, borderRadius: 10, backgroundColor: "#5ea4c5ff", alignItems: "center", justifyContent: "center", },
  submitBtnText: { color: "white", fontWeight: "700", fontSize: 15 },

  hint: { marginTop: 14, color: "#64748b", fontSize: 12 },
});

export const ScreenStyles = StyleSheet.create({

  page: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.00)", paddingTop: 48, paddingHorizontal: 16, width: "100%" },
  header: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { color: "#3c3c3cff", fontSize: 22, fontWeight: "700" , textAlign: "center" },

  alertError: { backgroundColor: "#fee2e2", borderColor: "#fecaca", borderWidth: 1, padding: 10, borderRadius: 10, marginBottom: 10 },
  alertErrorText: { color: "#991b1b" },
  alertOk: { backgroundColor: "#dcfce7", borderColor: "#bbf7d0", borderWidth: 1, padding: 10, borderRadius: 10, marginBottom: 10 },
  alertOkText: { color: "#166534" },

  btnPrimary: { backgroundColor: "#5ea4c5ff", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginBottom: 12},
  btnPrimaryText: { color: "white", fontWeight: "600", textAlign: "center" },
  btnSecondary: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#334155", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginBottom: 12 },
  btnSecondaryText: { color: "white", fontWeight: "600", textAlign: "center" },

  center: { paddingVertical: 24, alignItems: "center" },

  row: { fontSize: 12, borderWidth: 1, borderColor: "#cbd5e1", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 10 },
  rowNoWidth: { fontSize: 12, borderWidth: 0, borderColor: "#cbd5e1", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 10 },
  rowTitle: { fontWeight: "700", fontSize: 14 },
  rowMeta: { color: "#64748b", marginTop: 2, fontSize: 12,},

  textArea: { borderWidth: 1, textAlign: "top", borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, minHeight: 100, fontSize: 14 },

  smallBtn: { backgroundColor: "#262c39ff", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  dangerBtn: { backgroundColor: "#7f1d1d" },
  smallBtnText: { color: "white", fontWeight: "700", fontSize: 12 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "white", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },

  label: { fontSize: 13, marginTop: 8, marginBottom: 6, color: "#0f172a" },
  input: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  pickerWrapper: { fontSize: 13, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, overflow: "hidden", backgroundColor: "white", paddingHorizontal: 12, paddingVertical: 10},  

  sectionHeader: { backgroundColor: "#38435cff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginTop: 10, marginBottom: 8, },
  sectionHeaderText: { color: "white", fontWeight: "700", fontSize: 14, },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3f4a61",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionHeaderArrow: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
    marginHorizontal: 12,
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#69799d",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 8,
  },

});

