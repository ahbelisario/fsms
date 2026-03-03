import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const scale = isMobile ? 0.9 : 1; // Factor de escala para móvil

export const appStyles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: "rgba(0, 0, 0, 0.00)", 
    alignItems: "center", 
    justifyContent: "center",
  },
  card: { 
    width: "100%", 
    maxWidth: 350 * scale, 
    backgroundColor: "white", 
    borderRadius: 14, 
    padding: 24 * scale, 
    borderWidth: 1, 
    borderColor: "#cbd5e1" 
  },
  title: { 
    fontSize: 24 * scale, 
    fontWeight: "700" 
  },
  subtitle: { 
    marginTop: 6 * scale, 
    marginBottom: 18 * scale, 
    color: "#475569" 
  },

  label: { 
    fontSize: 12 * scale, 
    marginBottom: 6 * scale, 
    color: "#0f172a" 
  },
  input: { 
    width: "100%", 
    paddingVertical: 10 * scale, 
    paddingHorizontal: 12 * scale, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    fontSize: 16, // NO escalar - previene zoom en iOS
    marginBottom: 14 * scale,
  },

  passwordRow: { 
    flexDirection: "row", 
    gap: 8 * scale, 
    alignItems: "center", 
    marginBottom: 14 * scale 
  },
  toggleBtn: { 
    paddingVertical: 10 * scale, 
    paddingHorizontal: 12 * scale, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    backgroundColor: "#f8fafc",
  },
  toggleBtnText: { 
    fontSize: 13 * scale 
  },

  submitBtn: { 
    paddingVertical: 12 * scale, 
    borderRadius: 10, 
    backgroundColor: "#5ea4c5ff", 
    alignItems: "center", 
    justifyContent: "center",
  },
  submitBtnText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 15 * scale 
  },

  hint: { 
    marginTop: 14 * scale, 
    color: "#64748b", 
    fontSize: 12 * scale 
  },
});

export const ScreenStyles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: "rgba(0, 0, 0, 0.00)", 
    paddingTop: 24 * scale, 
    paddingHorizontal: 16 * scale, 
    alignSelf: "stretch", 
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  header: { 
    width: "100%", 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12 * scale 
  },
  title: { 
    color: "#3c3c3cff", 
    fontSize: 20 * scale, 
    fontWeight: "700", 
    textAlign: "center" 
  },

  alertError: { 
    backgroundColor: "#fee2e2", 
    borderColor: "#fecaca", 
    borderWidth: 1, 
    padding: 10 * scale, 
    borderRadius: 10, 
    marginBottom: 10 * scale 
  },
  alertErrorText: { 
    color: "#991b1b", 
    fontSize: 14 * scale 
  },
  alertOk: { 
    backgroundColor: "#dcfce7", 
    borderColor: "#bbf7d0", 
    borderWidth: 1, 
    padding: 10 * scale, 
    borderRadius: 10, 
    marginBottom: 10 * scale 
  },
  alertOkText: { 
    color: "#166534", 
    fontSize: 14 * scale 
  },

  btnPrimary: { 
    backgroundColor: "#5ea4c5ff", 
    paddingVertical: 10 * scale, 
    paddingHorizontal: 14 * scale, 
    borderRadius: 10, 
    marginBottom: 12 * scale
  },
  btnPrimaryText: { 
    color: "white", 
    fontWeight: "600", 
    textAlign: "center", 
    fontSize: 15 * scale 
  },
  btnSecondary: { 
    backgroundColor: "#111827", 
    borderWidth: 1, 
    borderColor: "#334155", 
    paddingVertical: 10 * scale, 
    paddingHorizontal: 14 * scale, 
    borderRadius: 10, 
    marginBottom: 12 * scale 
  },
  btnSecondaryText: { 
    color: "white", 
    fontWeight: "600", 
    textAlign: "center", 
    fontSize: 15 * scale 
  },

  center: { 
    paddingVertical: 24 * scale, 
    alignItems: "center" 
  },

  row: { 
    fontSize: 10 * scale, 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 * scale, 
    backgroundColor: "white", 
    borderRadius: 12, 
    padding: 12 * scale, 
    marginBottom: 10 * scale 
  },
  rowNoWidth: { 
    fontSize: 10 * scale, 
    borderWidth: 0, 
    borderColor: "#cbd5e1", 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 * scale, 
    backgroundColor: "white", 
    borderRadius: 12, 
    padding: 12 * scale, 
    marginBottom: 10 * scale 
  },
  rowTitle: { 
    fontWeight: "700", 
    fontSize: 12 * scale 
  },
  rowMeta: { 
    color: "#64748b", 
    marginTop: 2 * scale, 
    fontSize: 12 * scale
  },

  textArea: { 
    borderWidth: 1, 
    textAlignVertical: "top", 
    borderColor: "#cbd5e1", 
    borderRadius: 10, 
    paddingHorizontal: 12 * scale, 
    paddingVertical: 12 * scale, 
    minHeight: 100 * scale, 
    fontSize: 16 // NO escalar - previene zoom en iOS
  },

  smallBtn: { 
    backgroundColor: "#262c39ff", 
    paddingVertical: 8 * scale, 
    paddingHorizontal: 10 * scale, 
    borderRadius: 10 
  },
  dangerBtn: { 
    backgroundColor: "#7f1d1d" 
  },
  smallBtnText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 12 * scale 
  },

  modalBackdrop: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "center", 
    padding: 16 * scale 
  },
  modalCard: { 
    backgroundColor: "white", 
    borderRadius: 14, 
    padding: 16 * scale,
    maxWidth: '100%',
  },
  modalTitle: { 
    fontSize: 18 * scale, 
    fontWeight: "800", 
    marginBottom: 12 * scale 
  },

  label: { 
    fontSize: 13 * scale, 
    marginTop: 8 * scale, 
    marginBottom: 6 * scale, 
    color: "#0f172a" 
  },
  input: { 
    backgroundColor: "#ffffff", 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    borderRadius: 10, 
    paddingHorizontal: 12 * scale, 
    paddingVertical: 10 * scale,
    fontSize: 16, // NO escalar - previene zoom en iOS
  },

  pickerWrapper: { 
    fontSize: 13 * scale, 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    borderRadius: 10, 
    overflow: "hidden", 
    backgroundColor: "white", 
    paddingHorizontal: 12 * scale, 
    paddingVertical: 10 * scale
  },  

  sectionHeader: { 
    backgroundColor: "#38435cff", 
    paddingVertical: 8 * scale, 
    paddingHorizontal: 12 * scale, 
    borderRadius: 10, 
    marginTop: 10 * scale, 
    marginBottom: 8 * scale,
  },
  sectionHeaderText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 12 * scale,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3f4a61",
    paddingVertical: 10 * scale,
    paddingHorizontal: 12 * scale,
    borderRadius: 10,
    marginTop: 10 * scale,
    marginBottom: 8 * scale,
  },
  sectionHeaderArrow: {
    color: "white",
    fontWeight: "800",
    fontSize: 12 * scale,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8 * scale,
    marginHorizontal: 12 * scale,
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#69799d",
    paddingVertical: 10 * scale,
    paddingHorizontal: 12 * scale,
    borderRadius: 10,
    marginTop: 10 * scale,
    marginBottom: 8 * scale,
  },
});