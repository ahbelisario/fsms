import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, StyleSheet, View, Text } from "react-native";
import { ScoreCard } from "@/src/screens/helpers/ScoreCard";
import { ChartCard } from "@/src/screens/helpers/ChartCard";
import { api } from "@/src/api/client";
import { t } from "@/src/i18n";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from "@/src/ui/victory";
import { ScreenStyles } from '@/src/styles/appStyles';

export default function Dashboard({ onAuthExpired }) {
  // Totales
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDisciplines, setTotalDisciplines] = useState(0);
  const [totalRanks, setTotalRanks] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);
  const [totalMemberships, setTotalMemberships] = useState(0);
  const [totalScheduledClasses, setTotalScheduledClasses] = useState(0);

  // Datos para gráficas
  const [monthlyIncomes, setMonthlyIncomes] = useState([]);
  const [membershipsByPackage, setMembershipsByPackage] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [activeMemberships, setActiveMemberships] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  function clearMsgs() {
    setError("");
  }

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

  function formatMonthTick(m) {
    if (m instanceof Date) {
      return new Intl.DateTimeFormat("es-MX", { month: "short" }).format(m);
    }
    if (typeof m === "string") {
      const [y, mo] = m.split("-").map(Number);
      if (y && mo) {
        const d = new Date(y, mo - 1, 1);
        return new Intl.DateTimeFormat("es-MX", { month: "short" }).format(d);
      }
      return m;
    }
    return String(m);
  }

  // Procesar ingresos mensuales
  function processMonthlyIncomes(incomes) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsMap = new Map();

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsMap.set(key, { month: key, total: 0, count: 0 });
    }

    // Sumar ingresos
    incomes.forEach(income => {
      if (!income.income_date) return;
      
      // Extraer fecha sin conversión UTC
      const dateStr = toYMD(income.income_date);
      const [year, month] = dateStr.split('-').map(Number);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (monthsMap.has(key)) {
        const current = monthsMap.get(key);
        current.total += Number(income.amount || 0);
        current.count += 1;
      }
    });

    return Array.from(monthsMap.values()).map(item => ({
      month: formatMonthTick(item.month),
      total: item.total,
      count: item.count
    }));
  }

  // Procesar membresías por paquete
  function processMembershipsByPackage(memberships, packages) {
    const packageMap = new Map();

    packages.forEach(pkg => {
      packageMap.set(pkg.id, { name: pkg.name, count: 0 });
    });

    memberships.forEach(membership => {
      if (membership.package_id && packageMap.has(membership.package_id)) {
        packageMap.get(membership.package_id).count++;
      }
    });

    return Array.from(packageMap.values())
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  // Calcular membresías activas y por vencer
  function analyzeMemberships(memberships) {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const thirtyDaysFromNow = new Date(todayDate);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let active = 0;
    let expiring = 0;

    memberships.forEach(m => {
      if (!m.finish_date) return;
      
      // Extraer fecha sin conversión UTC
      const dateStr = toYMD(m.finish_date);
      const [year, month, day] = dateStr.split('-').map(Number);
      const finishDate = new Date(year, month - 1, day);
      
      if (finishDate >= todayDate) {
        active++;
        if (finishDate <= thirtyDaysFromNow) {
          expiring++;
        }
      }
    });

    return { active, expiring };
  }

  // Obtener próximas clases
  function getUpcomingClasses(classes) {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return classes
      .filter(c => {
        if (!c.scheduled_date) return false;
        
        // Extraer fecha sin conversión UTC
        const dateStr = toYMD(c.scheduled_date);
        const [year, month, day] = dateStr.split('-').map(Number);
        const classDate = new Date(year, month - 1, day);
        
        return classDate >= todayDate;
      })
      .sort((a, b) => {
        const dateStrA = toYMD(a.scheduled_date);
        const dateStrB = toYMD(b.scheduled_date);
        
        if (dateStrA !== dateStrB) {
          return dateStrA.localeCompare(dateStrB);
        }
        return (a.start_time || "").localeCompare(b.start_time || "");
      })
      .slice(0, 5);
  }

  async function loadDashboardData() {
    clearMsgs();
    setLoading(true);
    try {
      const [
        dataUsers,
        dataRanks,
        dataDisciplines,
        dataPackages,
        dataMemberships,
        dataIncomes,
        dataScheduledClasses
      ] = await Promise.all([
        api.listUsers(),
        api.listRanks(),
        api.listDisciplines(),
        api.listPackages(),
        api.listMemberships(),
        api.listIncomes(),
        api.listScheduledClasses()
      ]);

      setTotalUsers(Number(dataUsers?.total_rows ?? 0));
      setTotalRanks(Number(dataRanks?.total_rows ?? 0));
      setTotalDisciplines(Number(dataDisciplines?.total_rows ?? 0));
      setTotalPackages(Number(dataPackages?.total_rows ?? 0));
      setTotalMemberships(Number(dataMemberships?.total_rows ?? 0));
      setTotalScheduledClasses(Number(dataScheduledClasses?.total_rows ?? 0));

      const incomesList = Array.isArray(dataIncomes) ? dataIncomes : dataIncomes?.data || [];
      const monthlyData = processMonthlyIncomes(incomesList);
      setMonthlyIncomes(monthlyData);

      const membershipsList = Array.isArray(dataMemberships) ? dataMemberships : dataMemberships?.data || [];
      const packagesList = Array.isArray(dataPackages) ? dataPackages : dataPackages?.data || [];
      const packageData = processMembershipsByPackage(membershipsList, packagesList);
      setMembershipsByPackage(packageData);

      const { active, expiring } = analyzeMemberships(membershipsList);
      setActiveMemberships(active);
      setExpiringSoon(expiring);

      const classesList = Array.isArray(dataScheduledClasses) ? dataScheduledClasses : dataScheduledClasses?.data || [];
      const upcoming = getUpcomingClasses(classesList);
      setUpcomingClasses(upcoming);

    } catch (e) {
      if (e.code === "AUTH_EXPIRED") {
        onAuthExpired?.();
        setError(e.message);
        return;
      }
      setError(e.message || "No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
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
    <ScrollView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Dashboard</Text>
        <Pressable style={ScreenStyles.btnSecondary} onPress={loadDashboardData}>
          <Text style={ScreenStyles.btnSecondaryText}>🔄 Actualizar</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={ScreenStyles.alertError}>
          <Text style={ScreenStyles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {/* Sección: Estadísticas principales */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📊 Estadísticas Generales</Text>
        
        <View style={s.grid}>
          <View style={s.cell}>
            <ScoreCard 
              title={t("memberships.title")} 
              value={totalMemberships} 
              subtitle="Total" 
            />
          </View>
          <View style={s.cell}>
            <ScoreCard 
              title="Activas" 
              value={activeMemberships} 
              subtitle="Vigentes" 
            />
          </View>
        </View>

        <View style={s.grid}>
          <View style={s.cell}>
            <ScoreCard 
              title={t("users.title")} 
              value={totalUsers} 
              subtitle="Total" 
            />
          </View>
          <View style={s.cell}>
            <ScoreCard 
              title="Clases" 
              value={totalScheduledClasses} 
              subtitle="Programadas" 
            />
          </View>
        </View>

        <View style={s.grid}>
          <View style={s.cell}>
            <ScoreCard 
              title={t("packages.title")} 
              value={totalPackages} 
              subtitle="Total" 
            />
          </View>
          <View style={s.cell}>
            <ScoreCard 
              title="Por Vencer" 
              value={expiringSoon} 
              subtitle="Próximos 30 días" 
            />
          </View>
        </View>

        <View style={s.grid}>
          <View style={s.cell}>
            <ScoreCard 
              title={t("disciplines.title")} 
              value={totalDisciplines} 
              subtitle="Total" 
            />
          </View>
          <View style={s.cell}>
            <ScoreCard 
              title={t("ranks.title")} 
              value={totalRanks} 
              subtitle="Total" 
            />
          </View>
        </View>
      </View>

      {/* Sección: Ingresos mensuales */}
      {monthlyIncomes.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>💰 Ingresos Últimos 6 Meses</Text>
          <View style={s.chartContainer}>
            <VictoryChart 
              theme={VictoryTheme.material} 
              height={180} 
              domainPadding={{ x: 25 }}  // 👈 Agrega espacio entre barras
              padding={{ top: 20, bottom: 40, left: 50, right: 40 }}
            >
              <VictoryAxis
                tickFormat={(t) => t}
                style={{
                  tickLabels: { fontSize: 7, angle: -45, textAnchor: 'end' }
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `$${t >= 1000 ? (t/1000).toFixed(1) + 'k' : t}`}
                style={{
                  tickLabels: { fontSize: 7 }
                }}
              />
              <VictoryBar
                data={monthlyIncomes}
                x="month"
                y="total"
                barWidth={10}  // 👈 Controla el ancho de las barras
                style={{
                  data: { fill: "#3b82f6" }
                }}
                animate={{
                  duration: 500,
                  onLoad: { duration: 500 }
                }}
              />
            </VictoryChart>
          </View>
        </View>
      )}

      {/* Sección: Membresías por paquete (lista en lugar de pie chart) */}
      {membershipsByPackage.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>📦 Membresías por Paquete</Text>
          {membershipsByPackage.map((pkg, index) => (
            <View key={index} style={s.packageCard}>
              <View style={s.packageInfo}>
                <Text style={s.packageName}>{pkg.name}</Text>
                <Text style={s.packageCount}>{pkg.count} membresía{pkg.count !== 1 ? 's' : ''}</Text>
              </View>
              <View style={s.packageBar}>
                <View 
                  style={[
                    s.packageBarFill, 
                    { 
                      width: `${(pkg.count / totalMemberships) * 100}%`,
                      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Sección: Próximas clases */}
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

      {/* Alertas importantes */}
      {expiringSoon > 0 && (
        <View style={s.alertCard}>
          <Text style={s.alertTitle}>⚠️ Atención</Text>
          <Text style={s.alertText}>
            Hay {expiringSoon} membresía{expiringSoon > 1 ? 's' : ''} que vence{expiringSoon > 1 ? 'n' : ''} en los próximos 30 días.
          </Text>
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
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageCard: {
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
  packageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  packageCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  packageBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  packageBarFill: {
    height: '100%',
    borderRadius: 4,
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
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#78350f',
  },
});