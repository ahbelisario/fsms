import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Pressable, Text, TextInput, View, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import DatePickerField from "@/src/ui/DatePickerField";
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";

export default function RankPromotionScreen({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal de promoción
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Campos del formulario
  const [awardedDate, setAwardedDate] = useState(null);
  const [examScore, setExamScore] = useState("");
  const [notes, setNotes] = useState("");
  const [nextExamDate, setNextExamDate] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setSelectedStudent(null);
    setAwardedDate(null);
    setExamScore("");
    setNotes("");
    setNextExamDate(null);
  }

  function openPromoteModal(student) {
    clearMsgs();
    setSelectedStudent(student);
    setAwardedDate(new Date().toISOString().slice(0, 10));
    setExamScore("");
    setNotes("");
    setNextExamDate(null);
    setModalVisible(true);
  }

  async function loadPendingExams() {
    clearMsgs();
    setLoading(true);
    try {
      const data = await api.getPendingExams();
      const list = data?.data || [];
      setStudents(list);
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        return;
      }
      setError(e.message || "No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingExams();
  }, []);

  function askPromote() {
    setConfirmVisible(true);
  }

  function cancelConfirm() {
    setConfirmVisible(false);
  }

  async function confirmPromote() {
    setConfirmVisible(false);
    await promote();
  }

  async function promote() {
    if (!selectedStudent) return;

    clearMsgs();
    setSaving(true);

    try {
      const payload = {
        user_id: selectedStudent.user_id,
        new_rank_id: selectedStudent.next_rank_id,
        discipline_id: selectedStudent.discipline_id,
        awarded_date: awardedDate,
        exam_score: examScore ? parseFloat(examScore) : null,
        notes: notes.trim() || null,
        next_exam_date: nextExamDate || null,
      };

      await api.promoteStudent(payload);
      setSuccess(`${selectedStudent.name} ${selectedStudent.lastname} promovido a ${selectedStudent.next_rank_name}`);
      setModalVisible(false);
      resetForm();
      await loadPendingExams();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        return;
      }
      setError(e.message || "No se pudo promover al estudiante.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Filtrar estudiantes por categoría
  const readyStudents = students.filter(s => s.ready_for_exam);
  const upcomingStudents = students.filter(s => !s.ready_for_exam && s.days_until_exam !== null && s.days_until_exam <= 30);
  const otherStudents = students.filter(s => !s.ready_for_exam && (s.days_until_exam === null || s.days_until_exam > 30));

  return (
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>🥋 Promoción de Grados</Text>
        <Pressable style={ScreenStyles.btnSecondary} onPress={loadPendingExams} disabled={loading}>
          <Text style={ScreenStyles.btnSecondaryText}>
            {loading ? t("common.loading") : t("common.refresh")}
          </Text>
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

      {loading ? (
        <View style={ScreenStyles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {/* Estudiantes listos para examen */}
          {readyStudents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ✅ Listos para Examen ({readyStudents.length})
              </Text>
              {readyStudents.map((student) => (
                <StudentCard
                  key={student.user_id}
                  student={student}
                  onPromote={openPromoteModal}
                  formatDate={formatDate}
                  status="ready"
                />
              ))}
            </View>
          )}

          {/* Próximos exámenes (30 días) */}
          {upcomingStudents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📅 Próximos Exámenes ({upcomingStudents.length})
              </Text>
              {upcomingStudents.map((student) => (
                <StudentCard
                  key={student.user_id}
                  student={student}
                  onPromote={openPromoteModal}
                  formatDate={formatDate}
                  status="upcoming"
                />
              ))}
            </View>
          )}

          {/* Otros estudiantes */}
          {otherStudents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📋 En Progreso ({otherStudents.length})
              </Text>
              {otherStudents.map((student) => (
                <StudentCard
                  key={student.user_id}
                  student={student}
                  onPromote={openPromoteModal}
                  formatDate={formatDate}
                  status="progress"
                />
              ))}
            </View>
          )}

          {students.length === 0 && (
            <View style={ScreenStyles.center}>
              <Text style={{ color: "#64748b", marginTop: 40 }}>
                No hay estudiantes registrados
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal de promoción */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <View style={[ScreenStyles.modalCard, { maxHeight: '80%' }]}>
            <Text style={ScreenStyles.modalTitle}>Promover Estudiante</Text>

            {selectedStudent && (
              <>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {selectedStudent.name} {selectedStudent.lastname}
                  </Text>
                  <View style={styles.rankTransition}>
                    <View style={styles.rankBadge}>
                      <View style={[styles.rankColor, { backgroundColor: selectedStudent.current_rank_color || '#64748b' }]} />
                      <Text style={styles.rankText}>{selectedStudent.current_rank_name}</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View style={styles.rankBadge}>
                      <View style={[styles.rankColor, { backgroundColor: selectedStudent.next_rank_color || '#64748b' }]} />
                      <Text style={styles.rankText}>{selectedStudent.next_rank_name}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: 16 }}>
                  <DatePickerField
                    label="Fecha de examen/promoción *"
                    value={awardedDate}
                    onChange={setAwardedDate}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={ScreenStyles.label}>Calificación del examen (opcional)</Text>
                  <TextInput
                    style={ScreenStyles.input}
                    value={examScore}
                    onChangeText={setExamScore}
                    placeholder="ej: 8.5, 9.0"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={ScreenStyles.label}>Notas (opcional)</Text>
                  <TextInput
                    style={[ScreenStyles.input, { height: 80, textAlignVertical: "top" }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Observaciones sobre el examen..."
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <DatePickerField
                    label="Próximo examen (opcional)"
                    value={nextExamDate}
                    onChange={setNextExamDate}
                  />
                  <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Fecha estimada para el siguiente examen de grado
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
                  <Pressable
                    style={[ScreenStyles.btnSecondary, { flex: 1 }]}
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    <Text style={ScreenStyles.btnSecondaryText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                    style={[ScreenStyles.btnPrimary, { flex: 1, opacity: saving ? 0.7 : 1 }]}
                    onPress={askPromote}
                    disabled={saving || !awardedDate}
                  >
                    <Text style={ScreenStyles.btnPrimaryText}>
                      {saving ? "Guardando..." : "Promover"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Confirmar Promoción"
        message={`¿Confirmas promover a ${selectedStudent?.name} ${selectedStudent?.lastname} a ${selectedStudent?.next_rank_name}?`}
        confirmText="Promover"
        cancelText="Cancelar"
        onConfirm={confirmPromote}
        onCancel={cancelConfirm}
      />
    </View>
  );
}

function StudentCard({ student, onPromote, formatDate, status }) {
  const statusColors = {
    ready: { bg: '#dcfce7', border: '#10b981', text: '#065f46' },
    upcoming: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    progress: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' }
  };

  const colors = statusColors[status];

  return (
    <View style={[styles.card, { borderLeftColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {student.name} {student.lastname}
          </Text>
          <Text style={styles.cardSubtitle}>{student.discipline_name}</Text>
        </View>
        {student.ready_for_exam && (
          <View style={[styles.readyBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.readyText, { color: colors.text }]}>✓ Listo</Text>
          </View>
        )}
      </View>

      <View style={styles.rankRow}>
        <View style={styles.rankItem}>
          <View style={[styles.rankDot, { backgroundColor: student.current_rank_color || '#64748b' }]} />
          <Text style={styles.rankLabel}>{student.current_rank_name}</Text>
        </View>
        <Text style={styles.rankArrow}>→</Text>
        <View style={styles.rankItem}>
          <View style={[styles.rankDot, { backgroundColor: student.next_rank_color || '#64748b' }]} />
          <Text style={styles.rankLabel}>{student.next_rank_name}</Text>
        </View>
      </View>

      <View style={styles.requirements}>
        <View style={styles.requirement}>
          <Text style={styles.requirementIcon}>
            {student.meets_time_requirement ? '✅' : '⏳'}
          </Text>
          <Text style={styles.requirementText}>
            {student.months_elapsed}/{student.requirements_months} meses
          </Text>
        </View>
        <View style={styles.requirement}>
          <Text style={styles.requirementIcon}>
            {student.meets_class_requirement ? '✅' : '⏳'}
          </Text>
          <Text style={styles.requirementText}>
            {student.attendance_count}/{student.requirements_classes} clases
          </Text>
        </View>
      </View>

      {student.next_exam_date && (
        <Text style={styles.examDate}>
          📅 Examen: {formatDate(student.next_exam_date)}
          {student.days_until_exam !== null && (
            <Text style={styles.daysUntil}>
              {student.days_until_exam > 0
                ? ` (en ${student.days_until_exam} días)`
                : student.days_until_exam === 0
                ? ' (¡Hoy!)'
                : ` (hace ${Math.abs(student.days_until_exam)} días)`}
            </Text>
          )}
        </Text>
      )}

      <Pressable
        style={[styles.promoteButton, { opacity: student.ready_for_exam ? 1 : 0.6 }]}
        onPress={() => onPromote(student)}
      >
        <Text style={styles.promoteButtonText}>Promover a {student.next_rank_name}</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  rankLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  rankArrow: {
    fontSize: 18,
    color: '#94a3b8',
    marginHorizontal: 8,
  },
  requirements: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  requirementText: {
    fontSize: 13,
    color: '#64748b',
  },
  examDate: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  daysUntil: {
    color: '#64748b',
    fontWeight: '500',
  },
  promoteButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  promoteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  studentInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  rankTransition: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rankColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  arrow: {
    fontSize: 20,
    color: '#3b82f6',
    marginHorizontal: 12,
    fontWeight: '700',
  },
};