import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, StyleSheet, View, Text } from "react-native";
import { ScoreCard } from "@/src/screens/helpers/ScoreCard";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import { t } from "@/src/i18n";

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
    // Extraer YYYY-MM-DD y crear fecha local
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
    
    // Crear fechas sin hora para comparación exacta
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const ymd = toYMD(finishDate);
    const [year, month, day] = ymd.split('-').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    
    const diffTime = expiryDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getUpcomingClassesThisWeek(classes) {
    const today = new Date();
    // Crear fecha sin hora para comparación exacta
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const weekFromNow = new Date(todayDate);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    return classes
      .filter(c => {
        if (!c.scheduled_date) return false;
        
        // Extraer solo YYYY-MM-DD y crear fecha local
        const dateStr = toYMD(c.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        
        return classDate >= todayDate && classDate <= weekFromNow;
      })
      .sort((a, b) => {
        const dateStrA = toYMD(a.scheduled_date);
        const dateStrB = toYMD(b.scheduled_date);
        
        // Comparar strings directamente (YYYY-MM-DD se compara bien como string)
        if (dateStrA !== dateStrB) {
          return dateStrA.localeCompare(dateStrB);
        }
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
      // Obtener datos del usuario actual
      const meData = await api.me();
      const currentUser = meData.data || meData;
      setUser(currentUser);

      // Cargar datos en paralelo
      const [
        myMembership,
        myPayments,
        myProfile,
        classesData,
        enrollmentsData,
        attendanceData
      ] = await Promise.all([
        api.getMyMembership(),
        api.getMyPayments(),
        api.getMyProfile(),
        api.listScheduledClasses(),
        api.getMyEnrollments(),
        api.getMyAttendanceStats()
      ]);

      // Membresía activa
      const membership = myMembership.data;
      setActiveMembership(membership);

      if (membership?.finish_date) {
        const days = calculateDaysUntilExpiry(membership.finish_date);
        setDaysUntilExpiry(days);
      }

      // Pagos
      const paymentsList = Array.isArray(myPayments.data) ? myPayments.data : [];
      setLastPayment(paymentsList[0] || null);
      const total = paymentsList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      setTotalPayments(total);

      // Perfil
      setUserProfile(myProfile.data);

      // Clases programadas de esta semana
      const classesList = Array.isArray(classesData) ? classesData : classesData?.data || [];
      const upcoming = getUpcomingClassesThisWeek(classesList);
      setUpcomingClasses(upcoming);

      // Enrollments - Filtrar solo inscripciones futuras y activas
      const enrollmentsList = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData?.data || [];
      
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const activeEnrollments = enrollmentsList.filter(e => {
        if (!e.scheduled_date || e.status !== 'enrolled') return false;
        
        const dateStr = toYMD(e.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        
        return classDate >= todayDate;
      });

      setMyEnrollments(activeEnrollments);

      // Estadísticas de asistencia
      const stats = attendanceData?.data || null;
      setAttendanceStats(stats);

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
    <ScrollView style={s.container}>
      {/* Saludo personalizado */}
      <View style={s.welcomeCard}>
        <Text style={s.welcomeGreeting}>
          ¡Hola, {user?.name || 'Estudiante'}! 👋
        </Text>
        <Text style={s.welcomeSubtext}>
          Bienvenido de vuelta
        </Text>
      </View>

      {error ? (
        <View style={ScreenStyles.alertError}>
          <Text style={ScreenStyles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {/* Estado de membresía */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📋 Mi Membresía</Text>
        
        {activeMembership ? (
          <>
            <View style={s.grid}>
              <View style={s.cell}>
                <ScoreCard 
                  title="Paquete Actual" 
                  value={activeMembership.package_name || "N/A"}
                  subtitle="Activo"
                />
              </View>
              <View style={s.cell}>
                <ScoreCard 
                  title="Días Restantes" 
                  value={daysUntilExpiry !== null ? daysUntilExpiry : "N/A"}
                  subtitle={daysUntilExpiry < 30 ? "¡Renueva pronto!" : "Días"}
                />
              </View>
            </View>

            <View style={s.membershipCard}>
              <View style={s.membershipRow}>
                <Text style={s.membershipLabel}>Inicio:</Text>
                <Text style={s.membershipValue}>{formatDate(activeMembership.start_date)}</Text>
              </View>
              <View style={s.membershipRow}>
                <Text style={s.membershipLabel}>Vencimiento:</Text>
                <Text style={[
                  s.membershipValue,
                  daysUntilExpiry < 30 && s.expiringText
                ]}>
                  {formatDate(activeMembership.finish_date)}
                </Text>
              </View>
              <View style={s.membershipRow}>
                <Text style={s.membershipLabel}>Mensualidad:</Text>
                <Text style={s.membershipValue}>
                  ${activeMembership.fee} {activeMembership.currency}
                </Text>
              </View>
            </View>

            {daysUntilExpiry !== null && daysUntilExpiry < 30 && (
              <View style={s.warningCard}>
                <Text style={s.warningTitle}>⚠️ Renovación Próxima</Text>
                <Text style={s.warningText}>
                  Tu membresía vence en {daysUntilExpiry} días. Contacta a tu instructor para renovarla.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={s.noMembershipCard}>
            <Text style={s.noMembershipText}>
              No tienes una membresía activa. Contacta a tu instructor para más información.
            </Text>
          </View>
        )}
      </View>

      {/* Estadísticas de Asistencia */}
      {attendanceStats && attendanceStats.total_enrollments > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>📊 Mi Asistencia</Text>
          
          <View style={s.grid}>
            <View style={s.cell}>
              <ScoreCard 
                title="Clases Tomadas" 
                value={attendanceStats.attended || 0}
                subtitle="Asistencias"
              />
            </View>
            <View style={s.cell}>
              <ScoreCard 
                title="Tasa de Asistencia" 
                value={`${attendanceStats.attendance_rate || 0}%`}
                subtitle="Porcentaje"
              />
            </View>
          </View>

          {/* Detalle visual de asistencia */}
          <View style={s.attendanceCard}>
            <View style={s.attendanceRow}>
              <View style={s.attendanceItem}>
                <View style={[s.attendanceDot, { backgroundColor: '#10b981' }]} />
                <Text style={s.attendanceLabel}>Asistidas</Text>
                <Text style={s.attendanceValue}>{attendanceStats.attended || 0}</Text>
              </View>
              
              <View style={s.attendanceItem}>
                <View style={[s.attendanceDot, { backgroundColor: '#ef4444' }]} />
                <Text style={s.attendanceLabel}>Ausencias</Text>
                <Text style={s.attendanceValue}>{attendanceStats.no_show || 0}</Text>
              </View>
              
              <View style={s.attendanceItem}>
                <View style={[s.attendanceDot, { backgroundColor: '#94a3b8' }]} />
                <Text style={s.attendanceLabel}>Canceladas</Text>
                <Text style={s.attendanceValue}>{attendanceStats.cancelled || 0}</Text>
              </View>
            </View>

            {/* Barra de progreso visual */}
            {attendanceStats.attendance_rate !== null && (
              <View style={s.progressSection}>
                <View style={s.progressBar}>
                  <View 
                    style={[
                      s.progressFill, 
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
                <Text style={s.progressText}>
                  {attendanceStats.attendance_rate >= 80 ? '¡Excelente asistencia! 🎉' :
                   attendanceStats.attendance_rate >= 60 ? 'Buena asistencia 👍' :
                   'Intenta asistir más seguido 💪'}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Último pago */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>💳 Historial de Pagos</Text>
        
        <View style={s.grid}>
          <View style={s.cell}>
            <ScoreCard 
              title="Último Pago" 
              value={lastPayment ? `$${lastPayment.amount}` : "N/A"}
              subtitle={lastPayment ? formatDate(lastPayment.income_date) : "Sin pagos"}
            />
          </View>
          <View style={s.cell}>
            <ScoreCard 
              title="Total Pagado" 
              value={`$${totalPayments}`}
              subtitle="Histórico"
            />
          </View>
        </View>
      </View>

      {/* Mis Clases Inscritas */}
      {myEnrollments.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>📚 Mis Clases Inscritas</Text>
          {myEnrollments.map((enrollment, index) => {
            const dateStr = toYMD(enrollment.scheduled_date);
            const [year, month, day] = dateStr.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day);

            return (
              <View key={enrollment.id || index} style={s.myClassCard}>
                <View style={s.myClassHeader}>
                  <Text style={s.myClassTitle}>{enrollment.class_title}</Text>
                  <View style={s.enrolledBadge}>
                    <Text style={s.enrolledBadgeText}>✓ Inscrito</Text>
                  </View>
                </View>
                
                <View style={s.myClassDetails}>
                  <Text style={s.myClassDetail}>
                    📅 {displayDate.toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                  <Text style={s.myClassDetail}>
                    🕒 {enrollment.start_time?.slice(0,5)} - {enrollment.end_time?.slice(0,5)}
                  </Text>
                  <Text style={s.myClassDetail}>
                    👤 {enrollment.instructor_name} {enrollment.instructor_lastname}
                  </Text>
                  {enrollment.discipline_name && (
                    <Text style={s.myClassDetail}>
                      📚 {enrollment.discipline_name}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Próximas clases */}
      {upcomingClasses.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>📅 Próximas Clases</Text>
          {upcomingClasses.map((classItem, index) => {
            // Extraer fecha correctamente sin desfase
            const dateStr = toYMD(classItem.scheduled_date);
            const [year, month, day] = dateStr.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day);
            
            return (
              <View key={classItem.id || index} style={s.classCard}>
                <View style={s.classHeader}>
                  <Text style={s.classTitle}>{classItem.title}</Text>
                  <Text style={s.classDate}>
                    {displayDate.toLocaleDateString('es-MX', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Text>
                </View>
                <View style={s.classDetails}>
                  <Text style={s.classDetail}>
                    🕒 {classItem.start_time?.slice(0,5)} - {classItem.end_time?.slice(0,5)}
                  </Text>
                  <Text style={s.classDetail}>
                    👤 {classItem.instructor_name} {classItem.instructor_lastname}
                  </Text>
                  {classItem.discipline_name && (
                    <Text style={s.classDetail}>
                      📚 {classItem.discipline_name}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
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
  welcomeCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeGreeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#dbeafe',
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
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cell: {
    flex: 1,
  },
  membershipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  membershipLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  membershipValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  expiringText: {
    color: '#ef4444',
  },
  noMembershipCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noMembershipText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#78350f',
  },
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  attendanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  attendanceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  attendanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  myClassCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  myClassTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  enrolledBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  enrolledBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  myClassDetails: {
    gap: 6,
  },
  myClassDetail: {
    fontSize: 14,
    color: '#064e3b',
  },
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  classDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  classDetails: {
    gap: 4,
  },
  classDetail: {
    fontSize: 14,
    color: '#64748b',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profileLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  profileValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 22,
  },
  emptyProfile: {
    padding: 20,
    alignItems: 'center',
  },
  emptyProfileText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});