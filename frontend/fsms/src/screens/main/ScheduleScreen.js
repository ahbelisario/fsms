import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import DatePickerField from "@/src/ui/DatePickerField";
import { t } from "@/src/i18n";

export default function ScheduleScreen({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [disciplineId, setDisciplineId] = useState(null);
  const [instructorId, setInstructorId] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [maxCapacity, setMaxCapacity] = useState("20");
  const [notes, setNotes] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const isEditing = editingId !== null;

  const DAYS = [t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"), t("days.thu"), t("days.fri"), t("days.sat")];
  const MONTHS = [
    t("months.jan"), t("months.feb"), t("months.mar"), t("months.apr"), t("months.may"), t("months.jun"),
    t("months.jul"), t("months.aug"), t("months.sep"), t("months.oct"), t("months.nov"), t("months.dec")
  ];

  function clearMsgs() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDisciplineId(disciplines[0]?.id || null);
    setInstructorId(instructors[0]?.id || null);
    setScheduledDate("");
    setStartTime("09:00");
    setEndTime("10:00");
    setMaxCapacity("20");
    setNotes("");
  }

  function openCreate(date = null) {
    clearMsgs();
    resetForm();
    if (date) {
      setScheduledDate(toYMD(date));
    }
    setModalVisible(true);
  }

  function openEdit(classItem) {
    clearMsgs();
    setEditingId(classItem.id);
    setTitle(classItem.title || "");
    setDisciplineId(classItem.discipline_id || null);
    setInstructorId(classItem.instructor_id || null);
    setScheduledDate(toYMD(classItem.scheduled_date));
    setStartTime(classItem.start_time || "09:00");
    setEndTime(classItem.end_time || "10:00");
    setMaxCapacity(String(classItem.max_capacity || 20));
    setNotes(classItem.notes || "");
    setModalVisible(true);
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

  function toYMD(value) {
    if (!value) return "";
    
    // Si ya es YYYY-MM-DD, devuélvelo tal cual
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    
    // Si viene con timestamp ISO (2025-01-15T00:00:00.000Z)
    if (typeof value === "string" && value.includes('T')) {
      return value.slice(0, 10);
    }

    // Si es Date object, usa las partes locales para evitar offset de timezone
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    
    return `${y}-${m}-${day}`;
  }

  async function loadData() {
    clearMsgs();
    setLoading(true);
    try {
      const [classesData, disciplinesData, usersData] = await Promise.all([
        api.listScheduledClasses(),
        api.listDisciplines(),
        api.listUsers()
      ]);

      const classList = Array.isArray(classesData) ? classesData : classesData?.response || classesData?.data || [];
      setClasses(classList);

      const disciplinesList = Array.isArray(disciplinesData) ? disciplinesData : disciplinesData?.response || disciplinesData?.data || [];
      setDisciplines(disciplinesList);

      const usersList = Array.isArray(usersData) ? usersData : usersData?.response || usersData?.data || [];
      const instructorsList = usersList.filter(u => u.role === 'admin' || u.role === 'instructor');
      setInstructors(instructorsList);

      setDisciplineId(disciplinesList[0]?.id || null);
      setInstructorId(instructorsList[0]?.id || null);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar los datos.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  function validate() {
    if (!title.trim()) return "Título requerido.";
    if (!instructorId) return "Instructor requerido.";
    if (!scheduledDate) return "Fecha requerida.";
    if (!startTime) return "Hora de inicio requerida.";
    if (!endTime) return "Hora de fin requerida.";
    if (startTime >= endTime) return "La hora de inicio debe ser antes que la hora de fin.";
    return "";
  }

  async function save() {
    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        discipline_id: disciplineId,
        instructor_id: instructorId,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        max_capacity: Number(maxCapacity),
        notes: notes.trim()
      };

      if (isEditing) {
        await api.updateScheduledClass(editingId, payload);
        setSuccess("Clase actualizada.");
      } else {
        await api.createScheduledClass(payload);
        setSuccess("Clase creada.");
      }

      setModalVisible(false);
      resetForm();
      await loadData();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    clearMsgs();
    setLoading(true);
    try {
      await api.deleteScheduledClass(id);
      setSuccess("Clase eliminada.");
      await loadData();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }

  function getClassesForDate(date) {
    if (!date) return [];
    const dateStr = toYMD(date);
    return classes.filter(c => {
      const classDate = toYMD(c.scheduled_date);
      return classDate === dateStr;
    });
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }

  const days = getDaysInMonth(currentDate);

  return (
    <View style={ScreenStyles.page}>
      <View style={ScreenStyles.header}>
        <Text style={ScreenStyles.title}>{t("schedule.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={() => openCreate()}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("schedule.new_class")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable style={ScreenStyles.btnSecondary} onPress={goToToday}>
        <Text style={ScreenStyles.btnSecondaryText}>{t("schedule.today")}</Text>
      </Pressable>

      {/* Navegación del mes */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginBottom: 16,
        marginTop: 8
      }}>
        <Pressable onPress={previousMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24, color: '#3b82f6' }}>◀</Text>
        </Pressable>
        
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <Pressable onPress={nextMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24, color: '#3b82f6' }}>▶</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <ScrollView>
          {/* Encabezado días de la semana */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: '#e2e8f0',
            borderRadius: 8,
            padding: 8,
            marginBottom: 8
          }}>
            {DAYS.map((day, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', color: '#475569', fontSize: 12 }}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendario */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {days.map((date, index) => {
              const classesForDay = date ? getClassesForDate(date) : [];
              const isToday = date && 
                date.toDateString() === new Date().toDateString();
              const hasClasses = classesForDay.length > 0;
              const isSelected = selectedDate && date && 
                date.toDateString() === selectedDate.toDateString();

              return (
                <Pressable
                  key={index}
                  onPress={() => date && setSelectedDate(date)}
                  style={{
                    width: `${100/7}%`,
                    aspectRatio: 1,
                    padding: 2,
                  }}
                >
                  <View style={{
                    flex: 1,
                    backgroundColor: date ? (isSelected ? '#dbeafe' : '#ffffff') : 'transparent',
                    borderRadius: 8,
                    borderWidth: isToday ? 2 : 1,
                    borderColor: isToday ? '#3b82f6' : '#e2e8f0',
                    padding: 4,
                    justifyContent: 'space-between'
                  }}>
                    {date && (
                      <>
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: isToday ? '700' : '500',
                          color: isToday ? '#3b82f6' : '#1e293b',
                          textAlign: 'center'
                        }}>
                          {date.getDate()}
                        </Text>
                        
                        {hasClasses && (
                          <View style={{
                            backgroundColor: '#3b82f6',
                            borderRadius: 10,
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            alignSelf: 'center'
                          }}>
                            <Text style={{ 
                              color: '#ffffff', 
                              fontSize: 9,
                              fontWeight: '600'
                            }}>
                              {classesForDay.length}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Detalle del día seleccionado */}
          {selectedDate && (
            <View style={{
              marginTop: 16,
              backgroundColor: '#f8fafc',
              borderRadius: 8,
              padding: 16
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 12 
              }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700', 
                  color: '#1e293b'
                }}>
                {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
                </Text>
                <Pressable 
                  style={[ScreenStyles.btnPrimary, { paddingHorizontal: 12, paddingVertical: 8 }]}
                  onPress={() => openCreate(selectedDate)}
                >
                  <Text style={ScreenStyles.btnPrimaryText}>{t("common.add")}</Text>
                </Pressable>
              </View>

              {getClassesForDate(selectedDate).length === 0 ? (
                <Text style={{ color: '#64748b' }}>{t("schedule.no_classes")}</Text>
              ) : (
                getClassesForDate(selectedDate).map((classItem) => (
                  <View key={classItem.id} style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: '#3b82f6'
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontWeight: '700', fontSize: 16, flex: 1 }}>
                        {classItem.title}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable 
                          style={ScreenStyles.smallBtn} 
                          onPress={() => openEdit(classItem)}
                        >
                          <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
                        </Pressable>
                        <Pressable 
                          style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} 
                          onPress={() => askDelete(classItem.id)}
                        >
                          <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
                        </Pressable>
                      </View>
                    </View>
                    
                    {classItem.discipline_name && (
                      <Text style={{ color: '#64748b', marginBottom: 4 }}>
                        📚 {classItem.discipline_name}
                      </Text>
                    )}
                    <Text style={{ color: '#64748b', marginBottom: 4 }}>
                      🕒 {classItem.start_time?.slice(0,5)} - {classItem.end_time?.slice(0,5)}
                    </Text>
                    <Text style={{ color: '#64748b', marginBottom: 4 }}>
                      👤 {classItem.instructor_name} {classItem.instructor_lastname}
                    </Text>
                    <Text style={{ color: '#64748b' }}>
                      👥 {t("schedule.capacity")}: {classItem.current_enrollment || 0}/{classItem.max_capacity}
                    </Text>
                    {classItem.notes && (
                      <Text style={{ color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                        📝 {classItem.notes}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal para crear/editar */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={ScreenStyles.modalBackdrop}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
            <View style={ScreenStyles.modalCard}>
              <Text style={ScreenStyles.modalTitle}>
                {isEditing ? t("schedule.edit_class") : t("schedule.new_class")}
              </Text>

              <Text style={ScreenStyles.label}>{t("common.title")}</Text>
              <TextInput 
                style={ScreenStyles.input} 
                value={title} 
                onChangeText={setTitle}
                placeholder="Ej: Clase de Karate Infantil"
              />

              <Text style={ScreenStyles.label}>{t("disciplines.title")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker selectedValue={disciplineId} onValueChange={setDisciplineId}>
                  <Picker.Item label="Sin disciplina" value={null} />
                  {disciplines.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>

              <Text style={ScreenStyles.label}>{t("schedule.instructor")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker selectedValue={instructorId} onValueChange={setInstructorId}>
                  {instructors.map((instructor) => (
                    <Picker.Item 
                      key={instructor.id} 
                      label={`${instructor.name} ${instructor.lastname}`} 
                      value={instructor.id} 
                    />
                  ))}
                </Picker>
              </View>

              <DatePickerField
                label={t("schedule.date")}
                value={scheduledDate}
                onChange={setScheduledDate}
                placeholder="YYYY-MM-DD"
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={ScreenStyles.label}>{t("schedule.starttime")}</Text>
                  <TextInput 
                    style={ScreenStyles.input} 
                    value={startTime} 
                    onChangeText={setStartTime}
                    placeholder="09:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ScreenStyles.label}>{t("schedule.finishtime")}</Text>
                  <TextInput 
                    style={ScreenStyles.input} 
                    value={endTime} 
                    onChangeText={setEndTime}
                    placeholder="10:00"
                  />
                </View>
              </View>

              <Text style={ScreenStyles.label}>{t("schedule.maximumcapacity")}</Text>
              <TextInput 
                style={ScreenStyles.input} 
                value={maxCapacity} 
                onChangeText={setMaxCapacity}
                keyboardType="numeric"
              />

              <Text style={ScreenStyles.label}>{t("schedule.notes")}</Text>
              <TextInput 
                style={[ScreenStyles.input, { height: 80, textAlignVertical: "top" }]} 
                value={notes} 
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholder={t("common.additionalnotes")}
              />

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
                  onPress={save} 
                  disabled={saving}
                >
                  <Text style={ScreenStyles.btnPrimaryText}>
                    {saving ? t("common.saving") : t("common.save")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar Clase"
        message="¿Estás seguro de eliminar esta clase programada?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}