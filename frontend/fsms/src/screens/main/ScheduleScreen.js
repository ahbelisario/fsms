import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Modal, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/src/api/client";
import { ScreenStyles, ScheduleStyles, ManageEnrollmentsStyles } from '@/src/styles/appStyles';
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

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [disciplineId, setDisciplineId] = useState(null);
  const [instructorId, setInstructorId] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [maxCapacity, setMaxCapacity] = useState("20");
  const [notes, setNotes] = useState("");

  // Campos de recurrencia
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState([]);
  const [recurringEndDate, setRecurringEndDate] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isRecurringSeries, setIsRecurringSeries] = useState(false);

  const isEditing = editingId !== null;

  const DAYS = [t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"), t("days.thu"), t("days.fri"), t("days.sat")];
  const MONTHS = [
    t("months.jan"), t("months.feb"), t("months.mar"), t("months.apr"), t("months.may"), t("months.jun"),
    t("months.jul"), t("months.aug"), t("months.sep"), t("months.oct"), t("months.nov"), t("months.dec")
  ];

  // Días de la semana para recurrencia
  const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom', name: 'Domingo' },
    { value: 1, label: 'Lun', name: 'Lunes' },
    { value: 2, label: 'Mar', name: 'Martes' },
    { value: 3, label: 'Mié', name: 'Miércoles' },
    { value: 4, label: 'Jue', name: 'Jueves' },
    { value: 5, label: 'Vie', name: 'Viernes' },
    { value: 6, label: 'Sáb', name: 'Sábado' },
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
    setIsRecurring(false);
    setRecurringDays([]);
    setRecurringEndDate("");
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
    setIsRecurring(false); // No editar recurrencia en clases existentes
    setModalVisible(true);
  }

  function askDelete(classItem) {
    setToDeleteId(classItem.id);
    setIsRecurringSeries(classItem.is_recurring || false);
    setConfirmVisible(true);
  }

  function cancelDelete() {
    setConfirmVisible(false);
    setToDeleteId(null);
    setIsRecurringSeries(false);
  }

  async function confirmDelete() {
    setConfirmVisible(false);
    if (isRecurringSeries) {
      await removeSeries(toDeleteId);
    } else {
      await remove(toDeleteId);
    }
    setToDeleteId(null);
    setIsRecurringSeries(false);
  }

  function toYMD(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (typeof value === "string" && value.includes('T')) return value.slice(0, 10);
    
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    
    return `${y}-${m}-${day}`;
  }

  function toggleRecurringDay(dayValue) {
    if (recurringDays.includes(dayValue)) {
      setRecurringDays(recurringDays.filter(d => d !== dayValue));
    } else {
      setRecurringDays([...recurringDays, dayValue].sort((a, b) => a - b));
    }
  }

  function calculateEstimatedClasses(startDate, endDate, daysOfWeek) {
    if (!startDate || !endDate || daysOfWeek.length === 0) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    
    let count = 0;
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      if (daysOfWeek.includes(currentDate.getDay())) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
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
    
    if (isRecurring && recurringDays.length === 0) {
      return "Selecciona al menos un día para la recurrencia.";
    }
    if (isRecurring && !recurringEndDate) {
      return "Selecciona la fecha límite para las clases recurrentes.";
    }
    
    return "";
  }

  async function save() {
    clearMsgs();
    const v = validate();
    if (v) return setError(v);

    setSaving(true);
    try {
      if (isEditing) {
        // Editar clase existente
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

        await api.updateScheduledClass(editingId, payload);
        setSuccess("Clase actualizada.");

      } else if (isRecurring) {
        // Crear clases recurrentes
        const payload = {
          title: title.trim(),
          discipline_id: disciplineId,
          instructor_id: instructorId,
          start_time: startTime,
          end_time: endTime,
          max_capacity: Number(maxCapacity),
          notes: notes.trim() || null,
          start_date: scheduledDate,
          recurrence_days: recurringDays,
          recurrence_end_date: recurringEndDate,
        };

        const result = await api.createRecurringClasses(payload);
        setSuccess(`${result.total_classes} clases creadas exitosamente`);

      } else {
        // Crear clase única
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

  async function removeSeries(parentId) {
    clearMsgs();
    setLoading(true);
    try {
      await api.deleteRecurringSeries(parentId);
      setSuccess("Serie de clases eliminada.");
      await loadData();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo eliminar la serie.");
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
        <Text style={ScheduleStyles.headerTitle}>{t("schedule.title")}</Text>
        <Pressable style={ScreenStyles.btnPrimary} onPress={() => openCreate()}>
          <Text style={ScreenStyles.btnPrimaryText}>{t("schedule.new_class")}</Text>
        </Pressable>
      </View>

      {error ? <View style={ScreenStyles.alertError}><Text style={ScreenStyles.alertErrorText}>{error}</Text></View> : null}
      {success ? <View style={ScreenStyles.alertOk}><Text style={ScreenStyles.alertOkText}>{success}</Text></View> : null}

      <Pressable 
        style={[ScreenStyles.btnSecondary, { marginTop: 8 }]} 
        onPress={goToToday}>
        <Text style={ScreenStyles.btnSecondaryText}>{t("schedule.today")}</Text>
      </Pressable>

      {/* Navegación del mes */}
      <View style={ScheduleStyles.monthNav}>
        <Pressable onPress={previousMonth} style={ManageEnrollmentsStyles.navButton}>
          <Text style={{ fontSize: 20, color: '#3b82f6' }}>◀</Text>
        </Pressable>
        
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <Pressable onPress={nextMonth} style={ManageEnrollmentsStyles.navButton}>
          <Text style={{ fontSize: 20, color: '#3b82f6' }}>▶</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={ScreenStyles.center}><ActivityIndicator /></View>
      ) : (
        <ScrollView style={{ marginTop: 12}}>
          {/* Encabezado días de la semana */}
          <View style={ScheduleStyles.weekHeader}>
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
              const isToday = date && date.toDateString() === new Date().toDateString();
              const hasClasses = classesForDay.length > 0;
              const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();

              return (
                <Pressable
                  key={index}
                  onPress={() => date && setSelectedDate(date)}
                  style={ScheduleStyles.dayCell}
                >
                  <View style={[
                    ScheduleStyles.dayInner,
                    !date && { backgroundColor: 'transparent' },
                    isSelected && { backgroundColor: '#dbeafe' },
                    isToday && { borderWidth: 2, borderColor: '#3b82f6' }
                  ]}>
                    {date && (
                      <>
                        <Text style={[
                          ScheduleStyles.dayNumber,
                          isToday && { fontWeight: '700', color: '#3b82f6' }
                        ]}>
                          {date.getDate()}
                        </Text>
                        
                        {hasClasses && (
                          <>
                          <View></View>
                          <View style={ScheduleStyles.classBadge}>
                            <Text style={ScheduleStyles.classBadgeText}>
                              {classesForDay.length}
                            </Text>
                          </View>
                          <View></View>
                          <View></View>
                          </>
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
            <View style={ScheduleStyles.selectedDateDetails}>
              <View style={ScheduleStyles.selectedDateHeader}>
                <Text style={ScheduleStyles.selectedDateTitle}>
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
                  <View key={classItem.id} style={ScheduleStyles.classCard}>
                    <View style={ScheduleStyles.classCardHeader}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={ScheduleStyles.classCardTitle}>
                          {classItem.title}
                        </Text>
                        {classItem.is_recurring && (
                          <View style={ScheduleStyles.recurringBadge}>
                            <Text style={ScheduleStyles.recurringBadgeText}>🔁</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable 
                          style={ScreenStyles.smallBtn} 
                          onPress={() => openEdit(classItem)}
                        >
                          <Text style={ScreenStyles.smallBtnText}>{t("common.edit")}</Text>
                        </Pressable>
                        <Pressable 
                          style={[ScreenStyles.smallBtn, ScreenStyles.dangerBtn]} 
                          onPress={() => askDelete(classItem)}
                        >
                          <Text style={ScreenStyles.smallBtnText}>{t("common.delete")}</Text>
                        </Pressable>
                      </View>
                    </View>
                    
                    {classItem.discipline_name && (
                      <Text style={ScheduleStyles.classDetail}>📚 {classItem.discipline_name}</Text>
                    )}
                    <Text style={ScheduleStyles.classDetail}>
                      🕒 {classItem.start_time?.slice(0,5)} - {classItem.end_time?.slice(0,5)}
                    </Text>
                    <Text style={ScheduleStyles.classDetail}>
                      👤 {classItem.instructor_name} {classItem.instructor_lastname}
                    </Text>
                    <Text style={ScheduleStyles.classDetail}>
                      👥 {t("schedule.capacity")}: {classItem.current_enrollment || 0}/{classItem.max_capacity}
                    </Text>
                    {classItem.notes && (
                      <Text style={[ScheduleStyles.classDetail, { fontStyle: 'italic', marginTop: 4 }]}>
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
                <Picker 
                  selectedValue={disciplineId} 
                  onValueChange={setDisciplineId}
                  style={{ fontSize: 13 }}
                >
                  <Picker.Item label="Sin disciplina" value={null} />
                  {disciplines.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>

              <Text style={ScreenStyles.label}>{t("schedule.instructor")}</Text>
              <View style={ScreenStyles.pickerWrapper}>
                <Picker 
                  selectedValue={instructorId} 
                  onValueChange={setInstructorId}
                  style={{ fontSize: 13 }}
                >
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

              {/* Toggle de Recurrencia (solo al crear) */}
              {!isEditing && (
                <View style={{ marginTop: 16, marginBottom: 8 }}>
                  <Pressable 
                    style={[
                      ScheduleStyles.recurringToggle,
                      isRecurring && ScheduleStyles.recurringToggleActive
                    ]}
                    onPress={() => setIsRecurring(!isRecurring)}
                  >
                    <View style={[
                      ScheduleStyles.checkbox,
                      isRecurring && ScheduleStyles.checkboxActive
                    ]}>
                      {isRecurring && <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>}
                    </View>
                    <Text style={[
                      ScheduleStyles.recurringToggleText,
                      isRecurring && ScheduleStyles.recurringToggleTextActive
                    ]}>
                      Clase Recurrente
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Opciones de Recurrencia */}
              {isRecurring && !isEditing && (
                <View style={ScheduleStyles.recurringSection}>
                  <Text style={[ScreenStyles.label, { marginBottom: 8 }]}>
                    Repetir cada:
                  </Text>
                  <View style={ScheduleStyles.daysContainer}>
                    {DAYS_OF_WEEK.map(day => (
                      <Pressable
                        key={day.value}
                        onPress={() => toggleRecurringDay(day.value)}
                        style={[
                          ScheduleStyles.dayButton,
                          recurringDays.includes(day.value) && ScheduleStyles.dayButtonActive
                        ]}
                      >
                        <Text style={[
                          ScheduleStyles.dayButtonText,
                          recurringDays.includes(day.value) && ScheduleStyles.dayButtonTextActive
                        ]}>
                          {day.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {recurringDays.length > 0 && (
                    <View style={ScheduleStyles.daysSummary}>
                      <Text style={{ fontSize: 13, color: '#1e40af' }}>
                        Se repetirá los: {recurringDays.map(d => 
                          DAYS_OF_WEEK.find(day => day.value === d)?.name
                        ).join(', ')}
                      </Text>
                    </View>
                  )}

                  <Text style={ScreenStyles.label}>Fecha Límite *</Text>
                  <DatePickerField 
                    value={recurringEndDate} 
                    onChange={setRecurringEndDate}
                    placeholder="YYYY-MM-DD"
                  />

                  {recurringDays.length > 0 && recurringEndDate && scheduledDate && (
                    <View style={ScheduleStyles.estimationBox}>
                      <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '500' }}>
                        ℹ️ Se crearán aproximadamente {
                          calculateEstimatedClasses(scheduledDate, recurringEndDate, recurringDays)
                        } clases
                      </Text>
                    </View>
                  )}
                </View>
              )}

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
                style={ScreenStyles.textArea} 
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
        title={isRecurringSeries ? t("dialogs.delete.delete_class_series") : t("dialogs.delete.delete_class")}
        message={isRecurringSeries 
          ? t("dialogs.confirmation.delete_class_series")
          : t("dialogs.confirmation.delete_class")
        }
        confirmText={t("common.buttons.delete")}
        cancelText={t("common.buttons.cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}