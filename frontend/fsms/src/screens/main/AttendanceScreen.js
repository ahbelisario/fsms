import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AttendanceStyles } from "@/src/styles/appStyles";
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
    <ScrollView style={AttendanceStyles.container}>
      <View style={AttendanceStyles.header}>
        <Text style={AttendanceStyles.headerTitle}>{t("attendance.title")}</Text>
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
      <View style={AttendanceStyles.section}>
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
        <View style={AttendanceStyles.classInfoCard}>
          <Text style={AttendanceStyles.classInfoTitle}>{selectedClassData.title}</Text>
          <Text style={AttendanceStyles.classInfoDetail}>
            👤 {t("users.role_instructor")} {selectedClassData.instructor_name} {selectedClassData.instructor_lastname}
          </Text>
          
          <View style={AttendanceStyles.statsRow}>
            <View style={AttendanceStyles.statBox}>
              <Text style={AttendanceStyles.statNumber}>{stats.attended}</Text>
              <Text style={AttendanceStyles.statLabel}>{t("attendance.attended")}</Text>
            </View>
            <View style={AttendanceStyles.statBox}>
              <Text style={[AttendanceStyles.statNumber, { color: '#ef4444' }]}>{stats.absent}</Text>
              <Text style={AttendanceStyles.statLabel}>{t("attendance.absent")}</Text>
            </View>
            <View style={AttendanceStyles.statBox}>
              <Text style={[AttendanceStyles.statNumber, { color: '#94a3b8' }]}>{stats.pending}</Text>
              <Text style={AttendanceStyles.statLabel}>{t("attendance.pending")}</Text>
            </View>
          </View>

          {enrollments.length > 0 && (
            <View style={AttendanceStyles.quickActions}>
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
        <View style={AttendanceStyles.section}>
          {loading ? (
            <View style={ScreenStyles.center}>
              <ActivityIndicator />
            </View>
          ) : enrollments.length === 0 ? (
            <View style={AttendanceStyles.emptyState}>
              <Text style={AttendanceStyles.emptyText}>{t("enrollments.empty")}</Text>
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
                      AttendanceStyles.studentCard,
                      displayStatus === 'attended' && AttendanceStyles.attendedCard,
                      displayStatus === 'no_show' && AttendanceStyles.absentCard,
                      hasChanged && AttendanceStyles.changedCard
                    ]}
                    onPress={() => toggleAttendance(enrollment.id, displayStatus)}
                  >
                    <View style={AttendanceStyles.studentInfo}>
                      <Text style={AttendanceStyles.studentName}>
                        {enrollment.student_name} {enrollment.student_lastname}
                      </Text>
                      {hasChanged && (
                        <Text style={AttendanceStyles.changedBadge}>{t("enrollments.modified")}</Text>
                      )}
                    </View>

                    <View style={AttendanceStyles.statusIndicator}>
                      {displayStatus === 'attended' && (
                        <View style={AttendanceStyles.presentBadge}>
                          <Text style={AttendanceStyles.badgeText}>{t("attendance.attended")}</Text>
                        </View>
                      )}
                      {displayStatus === 'no_show' && (
                        <View style={AttendanceStyles.absentBadge}>
                          <Text style={AttendanceStyles.badgeText}>{t("attendance.absent")}</Text>
                        </View>
                      )}
                      {displayStatus === 'enrolled' && (
                        <View style={AttendanceStyles.pendingBadge}>
                          <Text style={AttendanceStyles.badgeText}>{t("attendance.pending")}</Text>
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
        <View style={AttendanceStyles.saveSection}>
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

