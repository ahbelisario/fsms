import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, StyleSheet, View, Text, Modal, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";

export default function ManageEnrollmentsScreen({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classEnrollments, setClassEnrollments] = useState([]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [newStatus, setNewStatus] = useState('enrolled');

  const STATUS_LABELS = {
    enrolled: t("attendance.enrolled"),
    attended: t("attendance.attended"),
    cancelled: t("attendance.cancelled"),
    no_show: t("attendance.no_show")
  };

  const STATUS_COLORS = {
    enrolled: '#3b82f6',
    attended: '#10b981',
    cancelled: '#94a3b8',
    no_show: '#ef4444'
  };

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

  async function loadData() {
    clearMsgs();
    setLoading(true);
    try {
      const [classesData, usersData] = await Promise.all([
        api.listScheduledClasses(),
        api.listUsers()
      ]);

      const classList = Array.isArray(classesData) ? classesData : classesData?.data || [];
      
      // Filtrar clases futuras y recientes (últimos 7 días)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const relevantClasses = classList.filter(c => {
        if (!c.scheduled_date) return false;
        const dateStr = toYMD(c.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        return classDate >= sevenDaysAgo;
      }).sort((a, b) => {
        const dateA = toYMD(a.scheduled_date);
        const dateB = toYMD(b.scheduled_date);
        return dateB.localeCompare(dateA);
      });

      setClasses(relevantClasses);

      const usersList = Array.isArray(usersData) ? usersData : usersData?.data || [];
      const students = usersList.filter(u => u.role === 'user');
      setUsers(students);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("messages.data_could_not_be_loaded"));
    } finally {
      setLoading(false);
    }
  }

  async function loadClassEnrollments(classId) {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.getClassEnrollments(classId);
      const list = Array.isArray(data) ? data : data?.data || [];
      setClassEnrollments(list);
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
      loadClassEnrollments(classId);
    } else {
      setClassEnrollments([]);
    }
  }

  function openAddModal() {
    if (!selectedClass) {
      setError("Selecciona una clase primero");
      return;
    }
    clearMsgs();
    setSelectedUser(users[0]?.id || null);
    setModalVisible(true);
  }

  function openStatusModal(enrollment) {
    setEditingEnrollment(enrollment);
    setNewStatus(enrollment.status);
    setStatusModalVisible(true);
  }

  function askDelete(id) {
    setToDeleteId(id);
    setConfirmVisible(true);
  }

  function cancelDelete() {
    setConfirmVisible(false);
    setToDeleteId(null);
  }

  async function confirmDelete() {
    setConfirmVisible(false);
    await remove(toDeleteId);
    setToDeleteId(null);
  }

  async function addEnrollment() {
    clearMsgs();
    if (!selectedUser || !selectedClass) {
      setError(t("classes.select_user_and_class"));
      return;
    }

    setSaving(true);
    try {
      await api.createEnrollment({ 
        class_id: selectedClass, 
        user_id: selectedUser 
      });
      setSuccess(t("enrollments.student_enrolled_succesfully"));
      setModalVisible(false);
      await loadClassEnrollments(selectedClass);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("enrollments.couldnt_be_erolled:"));
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus() {
    clearMsgs();
    setSaving(true);
    try {
      await api.updateEnrollmentStatus(editingEnrollment.id, { status: newStatus });
      setSuccess(t("common.status_updated"));
      setStatusModalVisible(false);
      setEditingEnrollment(null);
      await loadClassEnrollments(selectedClass);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("common.cannot_be_updated"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    clearMsgs();
    setLoading(true);
    try {
      await api.deleteEnrollment(id);
      setSuccess(t("enrollments.deleted"));
      await loadClassEnrollments(selectedClass);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("enrollments.couldnt_be_deleted"));
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const selectedClassData = classes.find(c => c.id === selectedClass);

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{t("enrollments.title")}</Text>
        <Pressable style={ScreenStyles.btnSecondary} onPress={loadData}>
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

      {/* Información de la clase seleccionada */}
      {selectedClassData && (
        <View style={s.classInfoCard}>
          <Text style={s.classInfoTitle}>{selectedClassData.title}</Text>
          <Text style={s.classInfoDetail}>
            👤 Instructor: {selectedClassData.instructor_name} {selectedClassData.instructor_lastname}
          </Text>
          <Text style={s.classInfoDetail}>
            👥 Inscritos: {classEnrollments.filter(e => e.status === 'enrolled').length} / {selectedClassData.max_capacity}
          </Text>
          <Text style={s.classInfoDetail}>
            ✓ Asistieron: {classEnrollments.filter(e => e.status === 'attended').length}
          </Text>

          <Pressable 
            style={[ScreenStyles.btnPrimary, { marginTop: 12 }]}
            onPress={openAddModal}
          >
            <Text style={ScreenStyles.btnPrimaryText}>+ {t("enrollments.enroll_student")}</Text>
          </Pressable>
        </View>
      )}

      {/* Lista de inscritos */}
      {selectedClass && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {t("enrollments.students_enrolled")} ({classEnrollments.length})
          </Text>

          {loading ? (
            <View style={ScreenStyles.center}>
              <ActivityIndicator />
            </View>
          ) : classEnrollments.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>{t("enrollments.empty")}</Text>
            </View>
          ) : (
            classEnrollments.map((enrollment) => (
              <View key={enrollment.id} style={s.enrollmentCard}>
                <View style={s.enrollmentHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.studentName}>
                      {enrollment.student_name} {enrollment.student_lastname}
                    </Text>
                    {enrollment.student_email && (
                      <Text style={s.studentEmail}>{enrollment.student_email}</Text>
                    )}
                    <Text style={s.enrollmentDate}>
                      Inscrito: {new Date(enrollment.enrollment_date).toLocaleDateString('es-MX')}
                    </Text>
                  </View>

                  <Pressable 
                    style={[s.statusBadge, { backgroundColor: STATUS_COLORS[enrollment.status] }]}
                    onPress={() => openStatusModal(enrollment)}
                  >
                    <Text style={s.statusBadgeText}>
                      {STATUS_LABELS[enrollment.status]}
                    </Text>
                  </Pressable>
                </View>

                {enrollment.notes && (
                  <View style={s.notesSection}>
                    <Text style={s.notesLabel}>{t("common.notes")}:</Text>
                    <Text style={s.notesText}>{enrollment.notes}</Text>
                  </View>
                )}

                <View style={s.enrollmentActions}>
                  <Pressable 
                    style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]}
                    onPress={() => askDelete(enrollment.id)}
                  >
                    <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View style={{ height: 40 }} />

      {/* Modal para agregar alumno */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{t("enrollments.enroll_student")}</Text>

            <Text style={ScreenStyles.label}>{t("students.student")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker selectedValue={selectedUser} onValueChange={setSelectedUser}>
                {users.map((u) => (
                  <Picker.Item 
                    key={u.id} 
                    label={`${u.name} ${u.lastname}`} 
                    value={u.id} 
                  />
                ))}
              </Picker>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable 
                style={[ScreenStyles.btnSecondary, { flex: 1 }]} 
                onPress={() => setModalVisible(false)} 
                disabled={saving}
              >
                <Text style={ScreenStyles.btnSecondaryText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable 
                style={[ScreenStyles.btnPrimary, { flex: 1, opacity: saving ? 0.7 : 1 }]} 
                onPress={addEnrollment} 
                disabled={saving}
              >
                <Text style={ScreenStyles.btnPrimaryText}>
                  {saving ? t("common.saving") : t("enrollments.enroll")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para cambiar status */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={ScreenStyles.modalCard}>
            <Text style={ScreenStyles.modalTitle}>{t("enrollments.change_status")}</Text>

            {editingEnrollment && (
              <Text style={s.enrollmentInfo}>
                {editingEnrollment.student_name} {editingEnrollment.student_lastname}
              </Text>
            )}

            <Text style={ScreenStyles.label}>{t("enrollments.new_status")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker selectedValue={newStatus} onValueChange={setNewStatus}>
                <Picker.Item label={t("attendance.enrolled")} value="enrolled" />
                <Picker.Item label={t("attendance.attended")} value="attended" />
                <Picker.Item label={t("attendance.cancelled")} value="cancelled" />
                <Picker.Item label={t("attendance.no_show")} value="no_show" />
              </Picker>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable 
                style={[ScreenStyles.btnSecondary, { flex: 1 }]} 
                onPress={() => setStatusModalVisible(false)} 
                disabled={saving}
              >
                <Text style={ScreenStyles.btnSecondaryText}>{t("common.cancel")}</Text>
              </Pressable>

              <Pressable 
                style={[ScreenStyles.btnPrimary, { flex: 1, opacity: saving ? 0.7 : 1 }]} 
                onPress={updateStatus} 
                disabled={saving}
              >
                <Text style={ScreenStyles.btnPrimaryText}>
                  {saving ? t("common.saving") : t("common.update")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar Inscripción"
        message="¿Estás seguro de eliminar esta inscripción?"
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
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
    marginBottom: 4,
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
  enrollmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  enrollmentDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1e293b',
  },
  enrollmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  enrollmentInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
});