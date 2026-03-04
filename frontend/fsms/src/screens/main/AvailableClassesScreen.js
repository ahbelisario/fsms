import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, View, Text, Modal } from "react-native";
import { AvailableClassesStyles } from "@/src/styles/appStyles";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ConfirmDialog from '@/src/ui/ConfirmDialog';
import { t } from "@/src/i18n";

export default function AvailableClassesScreen({ onAuthExpired }) {

  const s = ScreenStyles; // Al inicio del componente
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [actionType, setActionType] = useState(null); // 'enroll' or 'cancel'

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

  function isEnrolled(classId) {
    return myEnrollments.some(e => e.class_id === classId && e.status === 'enrolled');
  }

  function getAvailableSpots(classItem) {
    return (classItem.max_capacity || 0) - (classItem.current_enrollment || 0);
  }

  function isFull(classItem) {
    return getAvailableSpots(classItem) <= 0;
  }

  async function loadData() {
    clearMsgs();
    setLoading(true);
    try {
      const [classesData, enrollmentsData] = await Promise.all([
        api.listScheduledClasses(),
        api.getMyEnrollments()
      ]);

      const classList = Array.isArray(classesData) ? classesData : classesData?.data || [];
      
      // Filtrar solo clases futuras
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const futureClasses = classList.filter(c => {
        if (!c.scheduled_date) return false;
        const dateStr = toYMD(c.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        return classDate >= todayDate;
      });

      setClasses(futureClasses);

      const enrollmentsList = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data || [];
      setMyEnrollments(enrollmentsList);

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

  function askEnroll(classItem) {
    setSelectedClass(classItem);
    setActionType('enroll');
    setConfirmVisible(true);
  }

  function askCancel(classItem) {
    setSelectedClass(classItem);
    setActionType('cancel');
    setConfirmVisible(true);
  }

  function cancelAction() {
    setConfirmVisible(false);
    setSelectedClass(null);
    setActionType(null);
  }

  async function confirmAction() {
    setConfirmVisible(false);
    
    if (actionType === 'enroll') {
      await enrollInClass(selectedClass.id);
    } else if (actionType === 'cancel') {
      await cancelEnrollment(selectedClass.id);
    }
    
    setSelectedClass(null);
    setActionType(null);
  }

  async function enrollInClass(classId) {
    clearMsgs();
    setLoading(true);
    try {
      await api.enrollInClass({ class_id: classId });
      setSuccess(t("enrollments.succesfull"));
      await loadData();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("enrollments.error_enrolling"));
    } finally {
      setLoading(false);
    }
  }

  async function cancelEnrollment(classId) {
    clearMsgs();
    setLoading(true);
    try {
      await api.cancelEnrollment(classId);
      setSuccess(t("enrollments.enrollment_canceled"));
      await loadData();
    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || t("common.cannot_cancel"));
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (loading) {
    return (
      <View style={[ScreenStyles.page, ScreenStyles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={AvailableClassesStyles.container}>
      <View style={AvailableClassesStyles.header}>
        <Text style={AvailableClassesStyles.headerTitle}>{t("classes.availables")}</Text>
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

      {classes.length === 0 ? (
        <View style={AvailableClassesStyles.emptyState}>
          <Text style={AvailableClassesStyles.emptyText}>{t("classes.no_next_classes")}</Text>
        </View>
      ) : (
        classes.map((classItem) => {
          const enrolled = isEnrolled(classItem.id);
          const full = isFull(classItem);
          const availableSpots = getAvailableSpots(classItem);

          const dateStr = toYMD(classItem.scheduled_date);
          const [year, month, day] = dateStr.split('-').map(Number);
          const displayDate = new Date(year, month - 1, day);

          return (
            <View key={classItem.id} style={[
              s.classCard,
              enrolled && s.enrolledCard,
              full && !enrolled && s.fullCard
            ]}>
              <View style={AvailableClassesStyles.classHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={AvailableClassesStyles.classTitle}>{classItem.title}</Text>
                  <Text style={AvailableClassesStyles.classDate}>
                    {displayDate.toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                </View>
                {enrolled && (
                  <View style={AvailableClassesStyles.enrolledBadge}>
                    <Text style={AvailableClassesStyles.enrolledBadgeText}>{t("enrollments.enrolled")}</Text>
                  </View>
                )}
                {full && !enrolled && (
                  <View style={AvailableClassesStyles.fullBadge}>
                    <Text style={AvailableClassesStyles.fullBadgeText}>{t("enrollments.full")}</Text>
                  </View>
                )}
              </View>

              <View style={AvailableClassesStyles.classDetails}>
                <Text style={AvailableClassesStyles.classDetail}>
                  🕒 {classItem.start_time?.slice(0,5)} - {classItem.end_time?.slice(0,5)}
                </Text>
                <Text style={AvailableClassesStyles.classDetail}>
                  👤 {classItem.instructor_name} {classItem.instructor_lastname}
                </Text>
                {classItem.discipline_name && (
                  <Text style={AvailableClassesStyles.classDetail}>
                    📚 {classItem.discipline_name}
                  </Text>
                )}
                <Text style={[
                  s.classDetail,
                  availableSpots <= 3 && availableSpots > 0 && s.lowSpotsText,
                  availableSpots === 0 && s.fullText
                ]}>
                  👥 {availableSpots} lugar{availableSpots !== 1 ? 'es' : ''} disponible{availableSpots !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={AvailableClassesStyles.classActions}>
                {enrolled ? (
                  <Pressable 
                    style={[ScreenStyles.btnSecondary, s.actionButton]}
                    onPress={() => askCancel(classItem)}
                  >
                    <Text style={ScreenStyles.btnSecondaryText}>{t("enrollments.cancel_enrollment")}</Text>
                  </Pressable>
                ) : (
                  <Pressable 
                    style={[
                      ScreenStyles.btnPrimary, 
                      s.actionButton,
                      full && s.disabledButton
                    ]}
                    onPress={() => askEnroll(classItem)}
                    disabled={full}
                  >
                    <Text style={ScreenStyles.btnPrimaryText}>
                      {full ? t("classes.full") : t("enrollments.enroll_me")}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />

      <ConfirmDialog
        visible={confirmVisible}
        title={actionType === 'enroll' ? t("enrollments.enroll_me") : t("enrollments.cancel_enrollment")}
        message={
          actionType === 'enroll' 
            ? `${t("messages.sure_to_enroll_to")} "${selectedClass?.title}"?`
            : `${t("messages.sure_to_cancel_enrollment_to")} "${selectedClass?.title}"?`
        }
        confirmText={actionType === 'enroll' ? t("enrollments.enroll_me") : t("enrollments.cancel_enrollment")}
        cancelText={t("common.back")}
        danger={actionType === 'cancel'}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />
    </ScrollView>
  );
}

