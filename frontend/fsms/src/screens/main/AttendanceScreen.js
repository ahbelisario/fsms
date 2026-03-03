import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, StyleSheet, View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import { t } from "@/src/i18n";

export default function AttendanceScreen({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceChanges, setAttendanceChanges] = useState({});
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toYMD(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (typeof value === "string" && value.includes('T')) {
      return value.slice(0, 10);
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  async function loadClasses() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.listScheduledClasses();
      const classList = Array.isArray(data) ? data : data?.data || [];
      
      // Filtrar solo clases pasadas y de hoy
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const pastClasses = classList.filter(c => {
        if (!c.scheduled_date) return false;
        const dateStr = toYMD(c.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        return classDate <= todayDate;
      }).sort((a, b) => {
        const dateA = toYMD(a.scheduled_date);
        const dateB = toYMD(b.scheduled_date);
        return dateB.localeCompare(dateA); // Más recientes primero
      });

      setClasses(pastClasses);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("classes.load_error"));
    } finally {
      setLoading(false);
    }
  }

  async function loadEnrollments(classId) {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.getClassEnrollments(classId);
      const list = Array.isArray(data) ? data : data?.data || [];
      
      // Filtrar solo inscritos (no cancelados)
      const activeEnrollments = list.filter(e => e.status !== 'cancelled');
      setEnrollments(activeEnrollments);
      setAttendanceChanges({});
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("enrollments.load_error"));
    } finally {
      setLoading(false);
    }
  }

  function selectClass(classId) {
    setSelectedClass(classId);
    if (classId) {
      loadEnrollments(classId);
    } else {
      setEnrollments([]);
      setAttendanceChanges({});
    }
  }

  function toggleAttendance(enrollmentId, currentStatus) {
    const newStatus = currentStatus === 'attended' ? 'no_show' : 'attended';
    setAttendanceChanges(prev => ({
      ...prev,
      [enrollmentId]: newStatus
    }));
  }

  function getDisplayStatus(enrollmentId, originalStatus) {
    return attendanceChanges[enrollmentId] || originalStatus;
  }

  async function saveAttendance() {
    if (Object.keys(attendanceChanges).length === 0) {
      setError(t("common.no_changes"));
      return;
    }

    clearMsgs();
    setSaving(true);
    try {
      const attendances = Object.entries(attendanceChanges).map(([enrollment_id, status]) => ({
        enrollment_id: Number(enrollment_id),
        status
      }));

      await api.markAttendance({ attendances });
      setSuccess(`Asistencia guardada: ${attendances.length} registros actualizados`);
      setAttendanceChanges({});
      await loadEnrollments(selectedClass);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("attendance.error_save"));
    } finally {
      setSaving(false);
    }
  }

  function markAllPresent() {
    const changes = {};
    enrollments.forEach(e => {
      if (e.status === 'enrolled' || e.status === 'no_show') {
        changes[e.id] = 'attended';
      }
    });
    setAttendanceChanges(changes);
  }

  function markAllAbsent() {
    const changes = {};
    enrollments.forEach(e => {
      if (e.status === 'enrolled' || e.status === 'attended') {
        changes[e.id] = 'no_show';
      }
    });
    setAttendanceChanges(changes);
  }

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, [])
  );

  const selectedClassData = classes.find(c => c.id === selectedClass);
  const hasChanges = Object.keys(attendanceChanges).length > 0;
  
  const stats = enrollments.reduce((acc, e) => {
    const status = getDisplayStatus(e.id, e.status);
    if (status === 'attended') acc.attended++;
    else if (status === 'no_show') acc.absent++;
    else acc.pending++;
    return acc;
  }, { attended: 0, absent: 0, pending: 0 });

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{t("attendance.title")}</Text>
        <Pressable style={ScreenStyles.btnSecondary} onPress={loadClasses}>
          <Text style={ScreenStyles.btnSecondaryText}>{t("common.refresh")}</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={ScreenStyles.alertError}>
          <Text style={ScreenStyles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={ScreenStyles.alertOk}>
          <Text style={ScreenStyles.alertOkText}>{success}</Text>
        </View>
      ) : null}

      {/* Selector de clase */}
      <View style={s.section}>
        <Text style={ScreenStyles.label}>{t("classes.select_class")}</Text>
        <View style={ScreenStyles.pickerWrapper}>
          <Picker selectedValue={selectedClass} onValueChange={selectClass}>
            <Picker.Item label={"-- " + t("classes.select_class") + " --"} value={null} />
            {classes.map((c) => {
              const dateStr = toYMD(c.scheduled_date);
              const [year, month, day] = dateStr.split('-').map(Number);
              const displayDate = new Date(year, month - 1, day);
              const formattedDate = displayDate.toLocaleDateString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              });

              return (
                <Picker.Item 
                  key={c.id} 
                  label={`${c.title} - ${formattedDate} ${c.start_time?.slice(0,5)}`} 
                  value={c.id} 
                />
              );
            })}
          </Picker>
        </View>
      </View>

      {/* Información de la clase */}
      {selectedClassData && (
        <View style={s.classInfoCard}>
          <Text style={s.classInfoTitle}>{selectedClassData.title}</Text>
          <Text style={s.classInfoDetail}>
            👤 {t("users.role_instructor")} {selectedClassData.instructor_name} {selectedClassData.instructor_lastname}
          </Text>
          
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statNumber}>{stats.attended}</Text>
              <Text style={s.statLabel}>{t("attendance.attended")}</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNumber, { color: '#ef4444' }]}>{stats.absent}</Text>
              <Text style={s.statLabel}>{t("attendance.absent")}</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNumber, { color: '#94a3b8' }]}>{stats.pending}</Text>
              <Text style={s.statLabel}>{t("attendance.pending")}</Text>
            </View>
          </View>

          {enrollments.length > 0 && (
            <View style={s.quickActions}>
              <Pressable 
                style={[ScreenStyles.btnSecondary, { flex: 1 }]}
                onPress={markAllPresent}
              >
                <Text style={ScreenStyles.btnSecondaryText}>{t("attendance.all_attended")}</Text>
              </Pressable>
              <Pressable 
                style={[ScreenStyles.btnSecondary, { flex: 1 }]}
                onPress={markAllAbsent}
              >
                <Text style={ScreenStyles.btnSecondaryText}>{t("attendance.all_absent")}</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Lista de alumnos */}
      {selectedClass && (
        <View style={s.section}>
          {loading ? (
            <View style={ScreenStyles.center}>
              <ActivityIndicator />
            </View>
          ) : enrollments.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>{t("enrollements.empty")}</Text>
            </View>
          ) : (
            <>
              {enrollments.map((enrollment) => {
                const displayStatus = getDisplayStatus(enrollment.id, enrollment.status);
                const hasChanged = attendanceChanges[enrollment.id] !== undefined;

                return (
                  <Pressable 
                    key={enrollment.id} 
                    style={[
                      s.studentCard,
                      displayStatus === 'attended' && s.attendedCard,
                      displayStatus === 'no_show' && s.absentCard,
                      hasChanged && s.changedCard
                    ]}
                    onPress={() => toggleAttendance(enrollment.id, displayStatus)}
                  >
                    <View style={s.studentInfo}>
                      <Text style={s.studentName}>
                        {enrollment.student_name} {enrollment.student_lastname}
                      </Text>
                      {hasChanged && (
                        <Text style={s.changedBadge}>{t("enrollments.modified")}</Text>
                      )}
                    </View>

                    <View style={s.statusIndicator}>
                      {displayStatus === 'attended' && (
                        <View style={s.presentBadge}>
                          <Text style={s.badgeText}>{t("attendance.attended")}</Text>
                        </View>
                      )}
                      {displayStatus === 'no_show' && (
                        <View style={s.absentBadge}>
                          <Text style={s.badgeText}>{t("attendance.absent")}</Text>
                        </View>
                      )}
                      {displayStatus === 'enrolled' && (
                        <View style={s.pendingBadge}>
                          <Text style={s.badgeText}>{t("attendance.pending")}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      )}

      {/* Botón guardar */}
      {hasChanges && (
        <View style={s.saveSection}>
          <Pressable 
            style={[ScreenStyles.btnPrimary, { opacity: saving ? 0.7 : 1 }]}
            onPress={saveAttendance}
            disabled={saving}
          >
            <Text style={ScreenStyles.btnPrimaryText}>
              {saving ? t("common.saving") : `${t("common.save")} (${Object.keys(attendanceChanges).length} ${t("common.changes")})`}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    marginBottom: 24,
  },
  classInfoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  classInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  classInfoDetail: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  changedBadge: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 4,
  },
  statusIndicator: {
    marginLeft: 12,
  },
  presentBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  absentBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingBadge: {
    backgroundColor: '#94a3b8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveSection: {
    marginBottom: 20,
  },
});