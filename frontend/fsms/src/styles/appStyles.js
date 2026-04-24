import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;
const scale = isMobile ? 0.9 : 1; // Factor de escala para móvil

// ============================================
// ESTILOS GLOBALES (Login, Auth)
// ============================================
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
    marginBottom: 14 * scale,
    fontSize: 13,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    fontSize: 12 * scale
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
    fontSize: 14 * scale
  },

  hint: { 
    marginTop: 14 * scale, 
    color: "#64748b", 
    fontSize: 11 * scale
  },
});

// ============================================
// ESTILOS DE PANTALLAS GENERALES
// ============================================
export const ScreenStyles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    padding: 16 * scale, 
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
    marginBottom: 20 * scale 
  },
  title: { 
    color: "#3c3c3cff", 
    fontSize: 18 * scale,
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
    fontSize: 13 * scale
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
    fontSize: 13 * scale
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
    fontSize: 14 * scale
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
    fontSize: 14 * scale
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
    fontSize: 11 * scale
  },

  textArea: { 
    borderWidth: 1, 
    textAlignVertical: "top", 
    borderColor: "#cbd5e1", 
    borderRadius: 10, 
    paddingHorizontal: 12 * scale, 
    paddingVertical: 12 * scale, 
    minHeight: 100 * scale,
    fontSize: 13,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    fontSize: 11 * scale
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
    fontSize: 16 * scale,
    fontWeight: "800", 
    marginBottom: 12 * scale 
  },

  label: { 
    fontSize: 12 * scale,
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
    fontSize: 13,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  pickerWrapper: { 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    borderRadius: 10, 
    overflow: "hidden", 
    backgroundColor: "white", 
    paddingHorizontal: 12 * scale, 
    paddingVertical: 10 * scale,
    fontSize: 13,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    fontSize: 11 * scale,
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
    fontSize: 11 * scale,
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

// ============================================
// DASHBOARD ADMIN STYLES
// ============================================
export const DashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16 * scale,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * scale,
  },
  headerTitle: {
    fontSize: 28 * scale,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    marginBottom: 24 * scale,
  },
  sectionTitle: {
    fontSize: 18 * scale,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12 * scale,
  },
  grid: {
    flexDirection: 'row',
    gap: 12 * scale,
    marginBottom: 12 * scale,
  },
  cell: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * scale,
  },
  packageName: {
    fontSize: 16 * scale,
    fontWeight: '600',
    color: '#1e293b',
  },
  packageCount: {
    fontSize: 14 * scale,
    fontWeight: '500',
    color: '#64748b',
  },
  packageBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  packageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * scale,
  },
  classTitle: {
    fontSize: 16 * scale,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  classDate: {
    fontSize: 14 * scale,
    fontWeight: '600',
    color: '#3b82f6',
  },
  classDetails: {
    gap: 4 * scale,
  },
  classDetail: {
    fontSize: 14 * scale,
    color: '#64748b',
  },
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertTitle: {
    fontSize: 16 * scale,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4 * scale,
  },
  alertText: {
    fontSize: 14 * scale,
    color: '#78350f',
  },
});

// ============================================
// HOME (ESTUDIANTE) STYLES
// ============================================
export const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16 * scale,
  },
  welcomeCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24 * scale,
    marginBottom: 20 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeGreeting: {
    fontSize: 28 * scale,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4 * scale,
  },
  welcomeSubtext: {
    fontSize: 16 * scale,
    color: '#dbeafe',
  },
  section: {
    marginBottom: 24 * scale,
  },
  sectionTitle: {
    fontSize: 18 * scale,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12 * scale,
  },
  grid: {
    flexDirection: 'row',
    gap: 12 * scale,
    marginBottom: 12 * scale,
  },
  cell: {
    flex: 1,
  },
  membershipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8 * scale,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  membershipLabel: {
    fontSize: 14 * scale,
    color: '#64748b',
    fontWeight: '500',
  },
  membershipValue: {
    fontSize: 14 * scale,
    color: '#1e293b',
    fontWeight: '600',
  },
  expiringText: {
    color: '#ef4444',
  },
  noMembershipCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20 * scale,
    alignItems: 'center',
  },
  noMembershipText: {
    fontSize: 14 * scale,
    color: '#64748b',
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 16 * scale,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4 * scale,
  },
  warningText: {
    fontSize: 14 * scale,
    color: '#78350f',
  },
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16 * scale,
  },
  attendanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8 * scale,
  },
  attendanceLabel: {
    fontSize: 12 * scale,
    color: '#64748b',
    marginBottom: 4 * scale,
  },
  attendanceValue: {
    fontSize: 18 * scale,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressSection: {
    marginTop: 8 * scale,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8 * scale,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13 * scale,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  myClassCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myClassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12 * scale,
  },
  myClassTitle: {
    fontSize: 16 * scale,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  enrolledBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  enrolledBadgeText: {
    color: '#ffffff',
    fontSize: 12 * scale,
    fontWeight: '600',
  },
  myClassDetails: {
    gap: 6 * scale,
  },
  myClassDetail: {
    fontSize: 14 * scale,
    color: '#064e3b',
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * scale,
  },
  classTitle: {
    fontSize: 16 * scale,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  classDate: {
    fontSize: 14 * scale,
    fontWeight: '600',
    color: '#3b82f6',
  },
  classDetails: {
    gap: 4 * scale,
  },
  classDetail: {
    fontSize: 14 * scale,
    color: '#64748b',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileRow: {
    paddingVertical: 10 * scale,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profileLabel: {
    fontSize: 13 * scale,
    color: '#64748b',
    marginBottom: 4 * scale,
    fontWeight: '500',
  },
  profileValue: {
    fontSize: 15 * scale,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 22,
  },
  emptyProfile: {
    padding: 20 * scale,
    alignItems: 'center',
  },
  emptyProfileText: {
    fontSize: 14 * scale,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

// ============================================
// ATTENDANCE STYLES
// ============================================
export const AttendanceStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16 * scale,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * scale,
  },
  headerTitle: {
    fontSize: 28 * scale,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    marginBottom: 24 * scale,
  },
  classInfoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 24 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  classInfoTitle: {
    fontSize: 18 * scale,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8 * scale,
  },
  classInfoDetail: {
    fontSize: 14 * scale,
    color: '#475569',
    marginBottom: 12 * scale,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12 * scale,
    marginBottom: 16 * scale,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12 * scale,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24 * scale,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4 * scale,
  },
  statLabel: {
    fontSize: 12 * scale,
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12 * scale,
  },
  emptyState: {
    padding: 40 * scale,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16 * scale,
    color: '#64748b',
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendedCard: {
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  absentCard: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  changedCard: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16 * scale,
    fontWeight: '600',
    color: '#1e293b',
  },
  changedBadge: {
    fontSize: 12 * scale,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4 * scale,
  },
  statusIndicator: {
    marginLeft: 12 * scale,
  },
  presentBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  absentBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  pendingBadge: {
    backgroundColor: '#94a3b8',
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14 * scale,
    fontWeight: '600',
  },
  saveSection: {
    marginBottom: 20 * scale,
  },
});

// ============================================
// AVAILABLE CLASSES STYLES (Estudiantes)
// ============================================
export const AvailableClassesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16 * scale,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * scale,
  },
  headerTitle: {
    fontSize: 28 * scale,
    fontWeight: '700',
    color: '#1e293b',
  },
  emptyState: {
    padding: 40 * scale,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16 * scale,
    color: '#64748b',
    textAlign: 'center',
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrolledCard: {
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  fullCard: {
    borderLeftColor: '#94a3b8',
    opacity: 0.7,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12 * scale,
  },
  classTitle: {
    fontSize: 18 * scale,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4 * scale,
  },
  classDate: {
    fontSize: 14 * scale,
    color: '#3b82f6',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  enrolledBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  enrolledBadgeText: {
    color: '#ffffff',
    fontSize: 12 * scale,
    fontWeight: '600',
  },
  fullBadge: {
    backgroundColor: '#94a3b8',
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  fullBadgeText: {
    color: '#ffffff',
    fontSize: 12 * scale,
    fontWeight: '600',
  },
  classDetails: {
    gap: 6 * scale,
    marginBottom: 12 * scale,
  },
  classDetail: {
    fontSize: 14 * scale,
    color: '#64748b',
  },
  lowSpotsText: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  fullText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  classActions: {
    marginTop: 8 * scale,
  },
  actionButton: {
    paddingVertical: 12 * scale,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

// ============================================
// MANAGE ENROLLMENTS STYLES (Admin)
// ============================================
export const ManageEnrollmentsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16 * scale,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 * scale,
  },
  headerTitle: {
    fontSize: 28 * scale,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    marginBottom: 24 * scale,
  },
  sectionTitle: {
    fontSize: 18 * scale,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12 * scale,
  },
  classInfoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 24 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  classInfoTitle: {
    fontSize: 18 * scale,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8 * scale,
  },
  classInfoDetail: {
    fontSize: 14 * scale,
    color: '#475569',
    marginBottom: 4 * scale,
  },
  emptyState: {
    padding: 40 * scale,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16 * scale,
    color: '#64748b',
    textAlign: 'center',
  },
  enrollmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16 * scale,
    marginBottom: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8 * scale,
  },
  studentName: {
    fontSize: 16 * scale,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2 * scale,
  },
  studentEmail: {
    fontSize: 13 * scale,
    color: '#64748b',
    marginBottom: 4 * scale,
  },
  enrollmentDate: {
    fontSize: 12 * scale,
    color: '#94a3b8',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12 * scale,
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12 * scale,
    marginBottom: 8 * scale,
  },
  notesLabel: {
    fontSize: 12 * scale,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4 * scale,
  },
  notesText: {
    fontSize: 14 * scale,
    color: '#1e293b',
  },
  enrollmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8 * scale,
  },
  enrollmentInfo: {
    fontSize: 16 * scale,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16 * scale,
    textAlign: 'center',
  },
  // Estilos del filtro de mes/año
  monthSection: {
    marginBottom: 20 * scale,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 2 * scale,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  navButton: {
    padding: 8 * scale,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20 * scale,
    color: '#3b82f6',
  },
  monthLabelText: {
    fontSize: 16 * scale,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  noClassesBox: {
    backgroundColor: '#fef3c7',
    padding: 16 * scale,
    borderRadius: 8,
    marginTop: 12 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noClassesText: {
    color: '#92400e',
    fontSize: 14 * scale,
    textAlign: 'center',
  },
});

// ============================================
// SETTINGS DASHBOARD STYLES
// ============================================
export const SettingsDashboardStyles = StyleSheet.create({
  container: { 
    padding: 16 * scale, 
    gap: 12 * scale 
  },
  grid: { 
    flexDirection: "row", 
    gap: 12 * scale 
  },
  cell: { 
    flex: 1 
  },
});

// ============================================
// SCHEDULE SCREEN STYLES
// ============================================
export const ScheduleStyles = StyleSheet.create({
  headerTitle: {
    fontSize: 28 * scale,
    fontWeight: '700',
    color: '#1e293b',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 2 * scale,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8 * scale,
    marginBottom: 8 * scale
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    padding: 2 * scale,
  },
  dayInner: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 4 * scale,
    justifyContent: 'space-between'
  },
  dayNumber: {
    fontSize: 10 * scale,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center'
  },
  classBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,      // ← Aumentar
    minWidth: 24,          // ← Agregar
    minHeight: 24,         // ← Agregar
    paddingHorizontal: 6,  // ← Aumentar
    paddingVertical: 4,    // ← Aumentar
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 2,
  },
  classBadgeText: {
    color: '#ffffff',
    fontSize: 14 * scale,
    fontWeight: '600'
  },
  selectedDateDetails: {
    marginTop: 16 * scale,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16 * scale
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12 * scale
  },
  selectedDateTitle: {
    fontSize: 18 * scale,
    fontWeight: '700',
    color: '#1e293b'
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12 * scale,
    marginBottom: 8 * scale,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6'
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8 * scale
  },
  classCardTitle: {
    fontWeight: '700',
    fontSize: 16 * scale
  },
  classDetail: {
    color: '#64748b',
    marginBottom: 4 * scale
  },
  recurringBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 8 * scale,
    paddingVertical: 4 * scale,
  },
  recurringBadgeText: {
    fontSize: 11 * scale,
    color: '#3b82f6',
    fontWeight: '600'
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12 * scale,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  recurringToggleActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
    marginRight: 12 * scale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  recurringToggleText: {
    fontSize: 15 * scale,
    fontWeight: '600',
    color: '#64748b'
  },
  recurringToggleTextActive: {
    color: '#3b82f6'
  },
  recurringSection: {
    backgroundColor: '#f8fafc',
    padding: 16 * scale,
    borderRadius: 12,
    marginBottom: 16 * scale,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8 * scale,
    marginBottom: 16 * scale,
  },
  dayButton: {
    paddingHorizontal: 16 * scale,
    paddingVertical: 10 * scale,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    minWidth: 60,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayButtonText: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 13 * scale,
  },
  dayButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  daysSummary: {
    backgroundColor: '#dbeafe',
    padding: 12 * scale,
    borderRadius: 8,
    marginBottom: 16 * scale,
  },
  estimationBox: {
    backgroundColor: '#ecfdf5',
    padding: 12 * scale,
    borderRadius: 8,
    marginTop: 8 * scale,
  },
});

// ============================================
// PRIVACY NOTICE STYLES
// ============================================
export const PrivacyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 16 * scale,
    paddingBottom: 16 * scale,
    paddingHorizontal: 20 * scale,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  backBtn: {
    marginBottom: 8 * scale,
  },
  backText: {
    color: "#5ea4c5ff",
    fontSize: 14 * scale,
    fontWeight: "600",
  },
  title: {
    color: "#0f172a",
    fontSize: 20 * scale,
    fontWeight: "700",
    marginBottom: 4 * scale,
  },
  subtitle: {
    color: "#475569",
    fontSize: 13 * scale,
  },
  version: {
    color: "#94a3b8",
    fontSize: 12 * scale,
    marginTop: 4 * scale,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20 * scale,
    paddingBottom: 40 * scale,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16 * scale,
  },
  section: {
    marginBottom: 4 * scale,
  },
  sectionTitle: {
    fontSize: 14 * scale,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8 * scale,
  },
  sectionBody: {
    fontSize: 13 * scale,
    color: "#475569",
    lineHeight: 22,
  },
  footer: {
    marginTop: 24 * scale,
    paddingTop: 16 * scale,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    gap: 4 * scale,
  },
  footerText: {
    fontSize: 12 * scale,
    color: "#94a3b8",
  },
});