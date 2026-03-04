import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, View, Text, Modal, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ManageEnrollmentsStyles, ScreenStyles } from "@/src/styles/appStyles";
import { api } from "@/src/api/client";
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";

export default function ManageEnrollmentsScreen({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classEnrollments, setClassEnrollments] = useState([]);
  
  // Filtros de mes/año
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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

 const MONTHS = [
     t("months.jan"), t("months.feb"), t("months.mar"), t("months.apr"), t("months.may"), t("months.jun"),
     t("months.jul"), t("months.aug"), t("months.sep"), t("months.oct"), t("months.nov"), t("months.dec")
  ];

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

  function previousMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedClass(null); // Reset class selection
  }

  function nextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedClass(null); // Reset class selection
  }

  function goToCurrentMonth() {
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
    setSelectedClass(null);
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
      
      // Ordenar por fecha descendente (más reciente primero)
      const sortedClasses = classList.sort((a, b) => {
        const dateA = toYMD(a.scheduled_date);
        const dateB = toYMD(b.scheduled_date);
        return dateB.localeCompare(dateA);
      });

      setClasses(sortedClasses);

      const usersList = Array.isArray(usersData) ? usersData : usersData?.data || [];
      // const students = usersList.filter(u => u.role === 'user');
      setUsers(usersList);

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
    console.log('Selected class ID:', classId);
    // Convertir a número si viene como string
    const numericId = classId ? Number(classId) : null;
    setSelectedClass(numericId);
    if (numericId) {
      loadClassEnrollments(numericId);
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

  // Filtrar clases por mes/año seleccionado
  const filteredClasses = classes.filter(c => {
    if (!c.scheduled_date) return false;
    const dateStr = toYMD(c.scheduled_date);
    const [year, month] = dateStr.split('-').map(Number);
    return year === selectedYear && month === selectedMonth + 1;
  });

  // Buscar la clase seleccionada en TODAS las clases (no solo las filtradas)
  const selectedClassData = classes.find(c => c.id === selectedClass);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  return (
    <ScrollView style={ManageEnrollmentsStyles.container}>
      <View style={ManageEnrollmentsStyles.header}>
        <Text style={ManageEnrollmentsStyles.headerTitle}>{t("enrollments.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={loadData}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("common.refresh")}</Text>
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

      {/* Navegación de Mes/Año */}
      <View style={ManageEnrollmentsStyles.monthSection}>

        <Pressable 
          style={[ScreenStyles.btnSecondary, { marginTop: 8 }]}
          onPress={goToCurrentMonth}>
          <Text style={ScreenStyles.btnSecondaryText}>{t("months.current_month")}</Text>
        </Pressable>

        <View style={ManageEnrollmentsStyles.monthNav}>
          <Pressable onPress={previousMonth} style={ManageEnrollmentsStyles.navButton}>
            <Text style={ManageEnrollmentsStyles.navButtonText}>◀</Text>
          </Pressable>
          
          <Text style={ManageEnrollmentsStyles.monthLabelText}>
            {MONTHS[selectedMonth]} {selectedYear}
          </Text>
          
          <Pressable onPress={nextMonth} style={ManageEnrollmentsStyles.navButton}>
            <Text style={ManageEnrollmentsStyles.navButtonText}>▶</Text>
          </Pressable>
        </View>

        
      </View>

      {/* Selector de clase */}
      <View style={ManageEnrollmentsStyles.section}>
        <Text style={ScreenStyles.label}>
          {t("classes.select_class")} ({filteredClasses.length} {filteredClasses.length === 1 ? 'clase' : 'clases'})
        </Text>
        <View style={ScreenStyles.pickerWrapper}>
          <Picker 
            selectedValue={selectedClass} 
            onValueChange={selectClass}
            style={{ fontSize: 13 }}
          >
            <Picker.Item label={"-- " + t("classes.select_class") + " --"} value={null} />
            {filteredClasses.map((c) => {
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

        {filteredClasses.length === 0 && (
          <View style={ManageEnrollmentsStyles.noClassesBox}>
            <Text style={ManageEnrollmentsStyles.noClassesText}>
              📅 {t("classes.no_classes_schedules")} {MONTHS[selectedMonth]} {selectedYear}
            </Text>
          </View>
        )}
      </View>

      {/* Información de la clase seleccionada */}
      {selectedClass && selectedClassData && (
        <View style={ManageEnrollmentsStyles.classInfoCard}>
          <Text style={ManageEnrollmentsStyles.classInfoTitle}>{selectedClassData.title}</Text>
          <Text style={ManageEnrollmentsStyles.classInfoDetail}>
            👤 {t("users.role_instructor")}: {selectedClassData.instructor_name} {selectedClassData.instructor_lastname}
          </Text>
          <Text style={ManageEnrollmentsStyles.classInfoDetail}>
            👥 {t("enrollments.enrolled_plu")}: {classEnrollments.filter(e => e.status === 'enrolled').length} / {selectedClassData.max_capacity}
          </Text>
          <Text style={ManageEnrollmentsStyles.classInfoDetail}>
            ✓ {t("enrollments.attended")}: {classEnrollments.filter(e => e.status === 'attended').length}
          </Text>

          <Pressable 
            style={[ScreenStyles.btnPrimary, { marginTop: 12 }]}
            onPress={openAddModal}
          >
            <Text style={ScreenStyles.btnPrimaryText}>+ {t("enrollments.enroll_student")}</Text>
          </Pressable>
        </View>
      )}

      {/* Mensaje si no se encuentra la clase */}
      {selectedClass && !selectedClassData && (
        <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: '#991b1b', fontSize: 14 }}>
            ⚠️ {t("classes.load_error")}
          </Text>
        </View>
      )}

      {/* Lista de inscritos */}
      {selectedClass && (
        <View style={ManageEnrollmentsStyles.section}>
          <Text style={ManageEnrollmentsStyles.sectionTitle}>
            {t("enrollments.students_enrolled")} ({classEnrollments.length})
          </Text>

          {loading ? (
            <View style={ScreenStyles.center}>
              <ActivityIndicator />
            </View>
          ) : classEnrollments.length === 0 ? (
            <View style={ManageEnrollmentsStyles.emptyState}>
              <Text style={ManageEnrollmentsStyles.emptyText}>{t("enrollments.empty")}</Text>
            </View>
          ) : (
            classEnrollments.map((enrollment) => (
              <View key={enrollment.id} style={ManageEnrollmentsStyles.enrollmentCard}>
                <View style={ManageEnrollmentsStyles.enrollmentHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={ManageEnrollmentsStyles.studentName}>
                      {enrollment.student_name} {enrollment.student_lastname}
                    </Text>
                    {enrollment.student_email && (
                      <Text style={ManageEnrollmentsStyles.studentEmail}>{enrollment.student_email}</Text>
                    )}
                    <Text style={ManageEnrollmentsStyles.enrollmentDate}>
                      Inscrito: {new Date(enrollment.enrollment_date).toLocaleDateString('es-MX')}
                    </Text>
                  </View>

                  <Pressable 
                    style={[ManageEnrollmentsStyles.statusBadge, { backgroundColor: STATUS_COLORS[enrollment.status] }]}
                    onPress={() => openStatusModal(enrollment)}
                  >
                    <Text style={ManageEnrollmentsStyles.statusBadgeText}>
                      {STATUS_LABELS[enrollment.status]}
                    </Text>
                  </Pressable>
                </View>

                {enrollment.notes && (
                  <View style={ManageEnrollmentsStyles.notesSection}>
                    <Text style={ManageEnrollmentsStyles.notesLabel}>{t("common.notes")}:</Text>
                    <Text style={ManageEnrollmentsStyles.notesText}>{enrollment.notes}</Text>
                  </View>
                )}

                <View style={ManageEnrollmentsStyles.enrollmentActions}>
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
              <Picker 
                selectedValue={selectedUser} 
                onValueChange={setSelectedUser}
                style={{ fontSize: 13 }}
              >
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
              <Text style={ManageEnrollmentsStyles.enrollmentInfo}>
                {editingEnrollment.student_name} {editingEnrollment.student_lastname}
              </Text>
            )}

            <Text style={ScreenStyles.label}>{t("enrollments.new_status")}</Text>
            <View style={ScreenStyles.pickerWrapper}>
              <Picker 
                selectedValue={newStatus} 
                onValueChange={setNewStatus}
                style={{ fontSize: 13 }}
              >
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