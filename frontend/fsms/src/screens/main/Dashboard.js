import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Pressable, View, Text } from "react-native";
import { DashboardStyles } from "@/src/styles/appStyles";
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
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [previousMonthIncome, setPreviousMonthIncome] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MONTHS_SHORT = [t("months_short.jan"), t("months_short.feb"),t("months_short.mar"),t("months_short.apr"),t("months_short.may"),t("months_short.jun"),t("months_short.jul"),t("months_short.ago"),t("months_short.sep"),t("months_short.oct"),t("months_short.nov"),t("months_short.dec")];

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

  // Calcular ingresos del mes actual y anterior
  function calculateMonthlyIncomes(incomes) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    let currentTotal = 0;
    let previousTotal = 0;

    incomes.forEach(income => {
      if (!income.income_date) return;
      
      const dateStr = toYMD(income.income_date);
      const [year, month] = dateStr.split('-').map(Number);
      
      // Mes actual
      if (year === currentYear && month === currentMonth + 1) {
        currentTotal += Number(income.amount || 0);
      }
      
      // Mes anterior
      const prevMonth = currentMonth === 0 ? 12 : currentMonth;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      if (year === prevYear && month === prevMonth) {
        previousTotal += Number(income.amount || 0);
      }
    });

    return { currentTotal, previousTotal };
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
      
      // Calcular ingresos del mes actual y anterior
      const { currentTotal, previousTotal } = calculateMonthlyIncomes(incomesList);
      setCurrentMonthIncome(currentTotal);
      setPreviousMonthIncome(previousTotal);
      
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

  // Obtener nombre del mes actual y anterior
  const now = new Date();
  const currentMonthName = MONTHS_SHORT[now.getMonth()];
  const previousMonthName = MONTHS_SHORT[now.getMonth() === 0 ? 11 : now.getMonth() - 1];

  return (
    <ScrollView style={DashboardStyles.container}>
      {/* Header */}
      <View style={DashboardStyles.header}>
        <Text style={DashboardStyles.headerTitle}>{t("dashboards.title")}</Text>
        <Pressable style={ScreenStyles.btnSecondary} onPress={loadDashboardData}>
          <Text style={ScreenStyles.btnSecondaryText}>{t("common.refresh")}</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={ScreenStyles.alertError}>
          <Text style={ScreenStyles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {/* Sección: Ingresos mensuales */}
      <View style={DashboardStyles.section}>
        <Text style={DashboardStyles.sectionTitle}>💰 {t("incomes.title")}</Text>
        
        <View style={DashboardStyles.grid}>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={`${currentMonthName} ${now.getFullYear()}`}
              value={`$${currentMonthIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={t("incomes.currentmonth")}
            />
          </View>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={`${previousMonthName} ${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}`}
              value={`$${previousMonthIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={t("incomes.previousmonth")}
            />
          </View>
        </View>
      </View>

      {/* Sección: Estadísticas principales */}
      <View style={DashboardStyles.section}>
        <Text style={DashboardStyles.sectionTitle}>📊 {t("dashboards.statistics")}</Text>
        
        <View style={DashboardStyles.grid}>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={t("memberships.title")} 
              value={totalMemberships} 
              subtitle={t("common.total")} 
            />
          </View>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={t("memberships.actives")} 
              value={activeMemberships} 
              subtitle={t("memberships.current")}  
            />
          </View>
        </View>

        <View style={DashboardStyles.grid}>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={t("users.title")} 
              value={totalUsers} 
              subtitle={t("common.total")} 
            />
          </View>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={t("classes.title")}  
              value={totalScheduledClasses} 
              subtitle={t("classes.scheduled")}  
            />
          </View>
        </View>

        <View style={DashboardStyles.grid}>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={t("packages.title")} 
              value={totalPackages} 
              subtitle={t("common.total")} 
            />
          </View>
          <View style={DashboardStyles.cell}>
            <ScoreCard 
              title={t("memberships.expiringsoon")} 
              value={expiringSoon} 
              subtitle={t("memberships.next30days")}
            />
          </View>
        </View>
      </View>

      {/* Sección: Ingresos mensuales gráfica */}
      {monthlyIncomes.length > 0 && (
        <View style={DashboardStyles.section}>
          <Text style={DashboardStyles.sectionTitle}>💰 {t("incomes.incomeslast6months")}</Text>
          <View style={DashboardStyles.chartContainer}>
            <VictoryChart 
              theme={VictoryTheme.material} 
              height={180} 
              domainPadding={{ x: 25 }}
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
                barWidth={10}
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
        <View style={DashboardStyles.section}>
          <Text style={DashboardStyles.sectionTitle}>📦 {t("memberships.title")} {t("memberships.perpackage")}</Text>
          {membershipsByPackage.map((pkg, index) => (
            <View key={index} style={DashboardStyles.packageCard}>
              <View style={DashboardStyles.packageInfo}>
                <Text style={DashboardStyles.packageName}>{pkg.name}</Text>
                <Text style={DashboardStyles.packageCount}>{pkg.count} {pkg.count !== 1 ? t("memberships.title").toLowerCase() : t("memberships.title_single").toLowerCase()}</Text>
              </View>
              <View style={DashboardStyles.packageBar}>
                <View 
                  style={[
                    DashboardStyles.packageBarFill, 
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
        <View style={DashboardStyles.section}>
          <Text style={DashboardStyles.sectionTitle}>📅 {t("classes.nextclasses")}</Text>
          {upcomingClasses.map((classItem, index) => {
            // Extraer fecha correctamente sin desfase
            const dateStr = toYMD(classItem.scheduled_date);
            const [year, month, day] = dateStr.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day);

            return (
              <View key={classItem.id || index} style={DashboardStyles.classCard}>
                <View style={DashboardStyles.classHeader}>
                  <Text style={DashboardStyles.classTitle}>{classItem.title}</Text>
                  <Text style={DashboardStyles.classDate}>
                    {displayDate.toLocaleDateString('es-MX', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </Text>
                </View>
                <View style={DashboardStyles.classDetails}>
                  <Text style={DashboardStyles.classDetail}>
                    🕒 {classItem.start_time?.slice(0,5)} - {classItem.end_time?.slice(0,5)}
                  </Text>
                  <Text style={DashboardStyles.classDetail}>
                    👤 {classItem.instructor_name} {classItem.instructor_lastname}
                  </Text>
                  {classItem.discipline_name && (
                    <Text style={DashboardStyles.classDetail}>
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
        <View style={DashboardStyles.alertCard}>
          <Text style={DashboardStyles.alertTitle}>⚠️ {t("dashboards.attention")}</Text>
          <Text style={DashboardStyles.alertText}>
            {expiringSoon} {expiringSoon > 1 ? t("memberships.title".toLowerCase()) : t("memberships.title_single").toLowerCase()} {expiringSoon > 1 ? t("memberships.expiring").toLowerCase() : t("memberships.expiring_single").toLowerCase()} {t("dashboards.inthe")} {t("memberships.next30days").toLowerCase()}.
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}