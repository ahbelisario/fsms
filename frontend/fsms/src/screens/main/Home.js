import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, View, Text } from "react-native";
import { ScoreCard } from "@/src/screens/helpers/ScoreCard";
import { api } from "@/src/api/client";
import { HomeStyles, ScreenStyles } from '@/src/styles/appStyles';
import { t } from "@/src/i18n";
import RankProgressWidget from "@/src/components/RankProgressWidget";

export default function Home({ onAuthExpired }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Datos del alumno
  const [lastPayment, setLastPayment] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(null);
  const [totalPayments, setTotalPayments] = useState(0);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [rankProgress, setRankProgress] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

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

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const ymd = toYMD(dateStr);
    const [year, month, day] = ymd.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function calculateDaysUntilExpiry(finishDate) {
    if (!finishDate) return null;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const ymd = toYMD(finishDate);
    const [year, month, day] = ymd.split('-').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    const diffTime = expiryDate - todayDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * ✅ Helper: determina si una clase todavía no ha comenzado.
   * Si es hoy, compara también la hora de inicio.
   * Si es un día futuro, siempre retorna true.
   */
  function classIsUpcoming(scheduledDate, startTime) {
    if (!scheduledDate) return false;
    const now = new Date();
    const dateStr = toYMD(scheduledDate);
    const [year, month, day] = dateStr.split('-').map(Number);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const classDate = new Date(year, month - 1, day);

    // Día futuro → siempre visible
    if (classDate.getTime() > today.getTime()) return true;

    // Hoy → comparar hora
    if (classDate.getTime() === today.getTime() && startTime) {
      const [hh, mm] = startTime.split(':').map(Number);
      const classDateTime = new Date(year, month - 1, day, hh, mm);
      return classDateTime > now;
    }

    // Día pasado → no mostrar
    return false;
  }

  function getUpcomingClassesThisWeek(classes) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return classes
      .filter(c => {
        if (!c.scheduled_date) return false;
        const dateStr = toYMD(c.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);

        // ✅ Usar classIsUpcoming para filtrar por hora si es hoy
        return classIsUpcoming(c.scheduled_date, c.start_time) && classDate <= weekFromNow;
      })
      .sort((a, b) => {
        const dateStrA = toYMD(a.scheduled_date);
        const dateStrB = toYMD(b.scheduled_date);
        if (dateStrA !== dateStrB) return dateStrA.localeCompare(dateStrB);
        return (a.start_time || "").localeCompare(b.start_time || "");
      })
      .slice(0, 5);
  }

  function clearMsgs() {
    setError("");
  }

  async function loadStudentData() {
    clearMsgs();
    setLoading(true);
    try {
      const meData = await api.me();
      const currentUser = meData.data || meData;
      setUser(currentUser);

      const [
        myMembership,
        myPayments,
        myProfile,
        classesData,
        enrollmentsData,
        attendanceData,
        rankData
      ] = await Promise.all([
        api.getMyMembership(),
        api.getMyPayments(),
        api.getMyProfile(),
        api.listScheduledClasses(),
        api.getMyEnrollments(),
        api.getMyAttendanceStats(),
        api.getRankProgress()
      ]);

      // Membresía activa
      const membership = myMembership.data;
      setActiveMembership(membership);
      if (membership?.finish_date) {
        setDaysUntilExpiry(calculateDaysUntilExpiry(membership.finish_date));
      }

      // Pagos
      const paymentsList = Array.isArray(myPayments.data) ? myPayments.data : [];
      setLastPayment(paymentsList[0] || null);
      setTotalPayments(paymentsList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));

      // Perfil
      setUserProfile(myProfile.data);

      // Clases próximas esta semana (con filtro de hora)
      const classesList = Array.isArray(classesData) ? classesData : classesData?.data || [];
      setUpcomingClasses(getUpcomingClassesThisWeek(classesList));

      // Enrollments activos — ✅ filtrar por hora si la clase es hoy
      const enrollmentsList = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data || [];
      const activeEnrollments = enrollmentsList.filter(e => {
        if (!e.scheduled_date || e.status !== 'enrolled') return false;
        return classIsUpcoming(e.scheduled_date, e.start_time);
      });
      setMyEnrollments(activeEnrollments);

      // Asistencia y progreso
      setAttendanceStats(attendanceData?.data || null);
      setRankProgress(rankData?.data || null);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadStudentData();
    }, [])
  );

  useEffect(() => {
    loadStudentData();
  }, []);

  if (loading) {
    return (
      <View style={[ScreenStyles.page, ScreenStyles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={HomeStyles.container}>
      {/* Saludo personalizado */}
      <View style={HomeStyles.welcomeCard}>
        <Text style={HomeStyles.welcomeGreeting}>
          {`¡${t("labels.hi")}, ${user?.name || t("dashboards.unknown")}! 👋`}
        </Text>
        <Text style={HomeStyles.welcomeSubtext}>
          {t("dashboards.welcome_back")}
        </Text>
      </View>

      {error ? (
        <View style={ScreenStyles.alertError}>
          <Text style={ScreenStyles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {/* Estado de membresía */}
      <View style={HomeStyles.section}>
       {/* <Text style={HomeStyles.sectionTitle}>📋 {t("dashboards.my_membership")}</Text>*/}
        
        {/*activeMembership ? (
          <>
            <View style={HomeStyles.grid}>
              <View style={HomeStyles.cell}>
                <ScoreCard 
                  title={t("packages.title_single")} 
                  value={activeMembership.package_name || "N/A"}
                  subtitle={t("memberships.active")}
                />
              </View>
              <View style={HomeStyles.cell}>
                <ScoreCard 
                  title={t("memberships.remainingdays")} 
                  value={daysUntilExpiry !== null ? daysUntilExpiry : "N/A"}
                  subtitle={daysUntilExpiry < 30 ? "¡"+ t("memberships.renewsoon") +"!" : t("common.days")}
                />
              </View>
            </View>

            <View style={HomeStyles.membershipCard}>
              <View style={HomeStyles.membershipRow}>
                <Text style={HomeStyles.membershipLabel}>{t("memberships.start")}:</Text>
                <Text style={HomeStyles.membershipValue}>{formatDate(activeMembership.start_date)}</Text>
              </View>
              <View style={HomeStyles.membershipRow}>
                <Text style={HomeStyles.membershipLabel}>{t("memberships.expiration")}:</Text>
                <Text style={[
                  HomeStyles.membershipValue,
                  daysUntilExpiry < 30 && HomeStyles.expiringText
                ]}>
                  {formatDate(activeMembership.finish_date)}
                </Text>
              </View>
              <View style={HomeStyles.membershipRow}>
                <Text style={HomeStyles.membershipLabel}>{t("memberships.fee")}:</Text>
                <Text style={HomeStyles.membershipValue}>
                  ${activeMembership.fee} {activeMembership.currency}
                </Text>
              </View>
            </View>

            {daysUntilExpiry !== null && daysUntilExpiry < 30 && (
              <View style={HomeStyles.warningCard}>
                <Text style={HomeStyles.warningTitle}>⚠️ {t("memberships.renewsoon")}</Text>
                <Text style={HomeStyles.warningText}>
                  {t("memberships.expiresin")} {daysUntilExpiry} {t("common.days").toLowerCase()}. {t("memberships.contact")}.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={HomeStyles.noMembershipCard}>
            <Text style={HomeStyles.noMembershipText}>
              {t("dashboards.no_membership")}. {t("memberships.contact")}.
            </Text>
          </View>
        )*/}
      </View>

      {/* Estadísticas de Asistencia */}
      {attendanceStats && attendanceStats.total_enrollments > 0 ? (
        <View style={HomeStyles.section}>
          <Text style={HomeStyles.sectionTitle}>{`📊 ${t("dashboards.my_attendance")}`}</Text>
          
          <View style={HomeStyles.grid}>
            <View style={HomeStyles.cell}>
              <ScoreCard 
                title={t("dashboards.classes_attended")} 
                value={attendanceStats.attended || 0}
                subtitle={t("attendance.title")}
              />
            </View>
            <View style={HomeStyles.cell}>
              <ScoreCard 
                title={t("attendance.rate")} 
                value={`${attendanceStats.attendance_rate || 0}%`}
                subtitle={t("common.percentage")}
              />
            </View>
          </View>

          {/* Detalle visual de asistencia */}
          <View style={HomeStyles.attendanceCard}>
            <View style={HomeStyles.attendanceRow}>
              <View style={HomeStyles.attendanceItem}>
                <View style={[HomeStyles.attendanceDot, { backgroundColor: '#10b981' }]} />
                <Text style={HomeStyles.attendanceLabel}>{t("attendance.assisted")}</Text>
                <Text style={HomeStyles.attendanceValue}>{attendanceStats.attended || 0}</Text>
              </View>
              
              <View style={HomeStyles.attendanceItem}>
                <View style={[HomeStyles.attendanceDot, { backgroundColor: '#ef4444' }]} />
                <Text style={HomeStyles.attendanceLabel}>{t("attendance.absences")}</Text>
                <Text style={HomeStyles.attendanceValue}>{attendanceStats.no_show || 0}</Text>
              </View>
              
              <View style={HomeStyles.attendanceItem}>
                <View style={[HomeStyles.attendanceDot, { backgroundColor: '#94a3b8' }]} />
                <Text style={HomeStyles.attendanceLabel}>{t("attendance.cancelled_plu")}</Text>
                <Text style={HomeStyles.attendanceValue}>{attendanceStats.cancelled || 0}</Text>
              </View>
            </View>

            {/* Barra de progreso visual */}
            {attendanceStats.attendance_rate !== null ? (
              <View style={HomeStyles.progressSection}>
                <View style={HomeStyles.progressBar}>
                  <View 
                    style={[
                      HomeStyles.progressFill, 
                      { 
                        width: `${attendanceStats.attendance_rate}%`,
                        backgroundColor: 
                          attendanceStats.attendance_rate >= 80 ? '#10b981' :
                          attendanceStats.attendance_rate >= 60 ? '#f59e0b' :
                          '#ef4444'
                      }
                    ]} 
                  />
                </View>
                <Text style={HomeStyles.progressText}>
                  {attendanceStats.attendance_rate >= 80
                    ? `¡${t("messages.assistance.excellent_assistance")}! 🎉`
                    : attendanceStats.attendance_rate >= 60
                    ? `${t("messages.assistance.good_assistance")} 👍`
                    : `${t("messages.assistance.try_come_more")} 💪`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Progreso de Cinturón */}
      <RankProgressWidget rankData={rankProgress} />

      {/* Último pago */}
      <View style={HomeStyles.section}>
        <Text style={HomeStyles.sectionTitle}>{`💳 ${t("dashboards.payment_history")}`}</Text>
        
        <View style={HomeStyles.grid}>
          <View style={HomeStyles.cell}>
            <ScoreCard 
              title={t("dashboards.last_payment")} 
              value={lastPayment ? `$${lastPayment.amount}` : "N/A"}
              subtitle={lastPayment ? formatDate(lastPayment.income_date) : t("dashboards.no_payments")}
            />
          </View>
        </View>
      </View>

      {/* Mis Clases Inscritas */}
      {myEnrollments.length > 0 ? (
        <View style={HomeStyles.section}>
          <Text style={HomeStyles.sectionTitle}>{`📚 ${t("dashboards.my_enrolled_classes")}`}</Text>
          {myEnrollments.map((enrollment, index) => {
            const dateStr = toYMD(enrollment.scheduled_date);
            const [year, month, day] = dateStr.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day);

            return (
              <View key={enrollment.id || index} style={HomeStyles.myClassCard}>
                <View style={HomeStyles.myClassHeader}>
                  <Text style={HomeStyles.myClassTitle}>{enrollment.class_title}</Text>
                  <View style={HomeStyles.enrolledBadge}>
                    <Text style={HomeStyles.enrolledBadgeText}>{`✓ ${t("enrollments.enrolled")}`}</Text>
                  </View>
                </View>
                
                <View style={HomeStyles.myClassDetails}>
                  <Text style={HomeStyles.myClassDetail}>
                    {`📅 ${displayDate.toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}`}
                  </Text>
                  <Text style={HomeStyles.myClassDetail}>
                    {`🕒 ${enrollment.start_time?.slice(0,5)} - ${enrollment.end_time?.slice(0,5)}`}
                  </Text>
                  <Text style={HomeStyles.myClassDetail}>
                    {`👤 ${enrollment.instructor_name} ${enrollment.instructor_lastname}`}
                  </Text>
                  {enrollment.discipline_name ? (
                    <Text style={HomeStyles.myClassDetail}>
                      {`📚 ${enrollment.discipline_name}`}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Próximas clases */}
      {upcomingClasses.length > 0 ? (
        <View style={HomeStyles.section}>
          <Text style={HomeStyles.sectionTitle}>{`📅 ${t("dashboards.next_classes")}`}</Text>
          {upcomingClasses.map((classItem, index) => {
            const dateStr = toYMD(classItem.scheduled_date);
            const [year, month, day] = dateStr.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day);
            
            return (
              <View key={classItem.id || index} style={HomeStyles.classCard}>
                <View style={HomeStyles.classHeader}>
                  <Text style={HomeStyles.classTitle}>{classItem.title}</Text>
                  <Text style={HomeStyles.classDate}>
                    {displayDate.toLocaleDateString('es-MX', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Text>
                </View>
                <View style={HomeStyles.classDetails}>
                  <Text style={HomeStyles.classDetail}>
                    {`🕒 ${classItem.start_time?.slice(0,5)} - ${classItem.end_time?.slice(0,5)}`}
                  </Text>
                  <Text style={HomeStyles.classDetail}>
                    {`👤 ${classItem.instructor_name} ${classItem.instructor_lastname}`}
                  </Text>
                  {classItem.discipline_name ? (
                    <Text style={HomeStyles.classDetail}>
                      {`📚 ${classItem.discipline_name}`}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}