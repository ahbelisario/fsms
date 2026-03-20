// =====================================================
// Payment History Screen
// Ubicación: src/screens/user/PaymentHistoryScreen.js
// =====================================================

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { appStyles } from "@/src/styles/appStyles";
import { api } from "@/src/api/client";
import { notifyError } from "@/src/ui/notify";
import { t } from "@/src/i18n";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatCurrency(amount, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function getStatusColor(status) {
  const colors = {
    applied:   '#10b981',
    pending:   '#f59e0b',
    failed:    '#ef4444',
    cancelled: '#64748b'
  };
  return colors[status?.toLowerCase()] || '#64748b';
}

/**
 * Genera los últimos N meses en formato 'YYYY-MM', del más reciente al más antiguo.
 */
function getLastMonths(n = 4) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, date: d });
  }
  return months; // [mes actual, mes-1, mes-2, mes-3]
}

function monthLabel(date) {
  return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

// ── Componente: Score Card Mensual ────────────────────────────────────────────

function MonthlyStatusCard({ monthlyData }) {
  const months = getLastMonths(4); // [actual, -1, -2, -3]
  const paidSet = new Set((monthlyData || []).map(r => r.month));

  const currentMonthKey = months[0].key;
  const currentPaid     = paidSet.has(currentMonthKey);

  // Meses anteriores sin pago (excluye el actual)
  const unpaidPast = months.slice(1).filter(m => !paidSet.has(m.key));

  // Color del card principal
  const cardBg      = currentPaid ? '#10b981' : '#ef4444';
  const cardBgLight = currentPaid ? '#d1fae5' : '#fee2e2';
  const cardText    = currentPaid ? '#065f46' : '#991b1b';

  return (
    <View style={{ marginTop: 16 }}>

      {/* Card principal: estado del mes actual */}
      <View style={{
        backgroundColor: cardBg,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 12, color: '#fff', opacity: 0.85, marginBottom: 4 }}>
          {monthLabel(months[0].date)}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 28 }}>
            {currentPaid ? '✅' : '⚠️'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
              {currentPaid ? t("payments.applied") : t("payments.pending")}  
            </Text>
            <Text style={{ fontSize: 12, color: '#fff', opacity: 0.85, marginTop: 2 }}>
              {currentPaid
                ? `${t("payments.payment")} ${monthLabel(months[0].date)}`
                : `${t("payments.payment")} ${monthLabel(months[0].date)} ${t("payments.pending").toLowerCase()}`}
            </Text>
          </View>
        </View>

        {/* Última fecha de pago del mes si existe */}
        {currentPaid && monthlyData?.find(r => r.month === currentMonthKey)?.last_payment_date && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)' }}>
            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.85 }}>
              {t("payments.last_payment")}: {formatDate(monthlyData.find(r => r.month === currentMonthKey).last_payment_date)}
            </Text>
          </View>
        )}
      </View>

      {/* Alertas de meses anteriores sin pago */}
      {unpaidPast.length > 0 && (
        <View style={{
          backgroundColor: '#fff7ed',
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#f97316',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#9a3412', marginBottom: 8 }}>
            🔔 {unpaidPast.length === 1 ? t("labels.pending_payments") : t("labels.pending_payments") }
          </Text>
          {unpaidPast.map(m => (
            <View key={m.key} style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 4,
              gap: 8,
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f97316',
              }} />
              <Text style={{ fontSize: 13, color: '#9a3412' }}>
                {/* "Debes el pago de febrero" / "You owe the payment of february" */}
                {monthLabel(m.date)}
              </Text>
            </View>
          ))}
          <Text style={{ fontSize: 11, color: '#c2410c', marginTop: 8 }}>
            {t("memberships.contact")}
          </Text>
        </View>
      )}

      {/* Si todo está al corriente */}
      {unpaidPast.length === 0 && currentPaid && (
        <View style={{
          backgroundColor: '#f0fdf4',
          borderRadius: 12,
          padding: 14,
          marginTop: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#10b981',
        }}>
          <Text style={{ fontSize: 13, color: '#065f46' }}>
            ✅ {t("messages.success.no_debts_in_last_4months")}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────

export default function PaymentHistoryScreen() {
  const [payments,     setPayments]     = useState([]);
  const [monthlyData,  setMonthlyData]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [pagination,   setPagination]   = useState({ limit: 10, offset: 0, hasMore: false });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [historyResponse, monthlyResponse] = await Promise.all([
        api.getPaymentHistory({ limit: 10, offset: 0 }),
        api.getMonthlyPaymentStatus(),          // ← nuevo endpoint
      ]);

      setPayments(historyResponse.data.payments);
      setPagination(historyResponse.data.pagination);
      setMonthlyData(monthlyResponse.data || []);
    } catch (err) {
      console.error('Error loading payment history:', err);
      notifyError(err.message || t("messages.data_could_not_be_loaded"));
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      const [historyResponse, monthlyResponse] = await Promise.all([
        api.getPaymentHistory({ limit: 10, offset: 0 }),
        api.getMonthlyPaymentStatus(),
      ]);
      setPayments(historyResponse.data.payments);
      setPagination(historyResponse.data.pagination);
      setMonthlyData(monthlyResponse.data || []);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadMore() {
    if (!pagination.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const newOffset = pagination.offset + pagination.limit;
      const response = await api.getPaymentHistory({
        limit: pagination.limit,
        offset: newOffset
      });
      setPayments(prev => [...prev, ...response.data.payments]);
      setPagination(response.data.pagination);
    } catch (err) {
      notifyError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ padding: 16, width: '100%' }}>

          {/* Header */}
          <Text style={appStyles.title}>{t("payments.payments_history")}</Text>
          <Text style={appStyles.subtitle}>{t("payments.last_payments_registered")}</Text>

          {/* Score card mensual */}
          <MonthlyStatusCard monthlyData={monthlyData} />

          {/* Lista de pagos */}
          <View style={{ marginTop: 24, width: '100%' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              {t("payments.last_pl")} {pagination.limit} {t("payments.title").toLowerCase()}
            </Text>

            {payments.length === 0 ? (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 32,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Text style={{ fontSize: 48, marginBottom: 8 }}>💳</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>
                  {t("payments.empty")}
                </Text>
              </View>
            ) : (
              <>
                {payments.map((payment) => (
                  <View key={payment.id} style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}>
                    {/* Header del pago */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ flex: 1, minWidth: 200 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
                          {payment.description || 'Sin descripción'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                          {formatDate(payment.income_date)}
                        </Text>
                      </View>
                      {payment.status && (
                        <View style={{
                          backgroundColor: getStatusColor(payment.status) + '20',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: getStatusColor(payment.status) }}>
                            {t("payments." + payment.status.toLowerCase())}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Monto */}
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#10b981', marginBottom: 8 }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </Text>

                    {/* Detalles */}
                    <View style={{ gap: 4 }}>
                      {payment.income_type_name && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>{t("payments.type")}: </Text>
                          <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '500' }}>
                            {t("payments." + payment.income_type_name.toLowerCase())}
                          </Text>
                        </View>
                      )}
                      {payment.income_method && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>{t("payments.payment_method")}: </Text>
                          <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '500' }}>
                            {t("payments." + payment.income_method.toLowerCase())}
                          </Text>
                        </View>
                      )}
                      {payment.reference && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>{t("payments.reference")}: </Text>
                          <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '500' }}>
                            {payment.reference}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}

                {/* Load More */}
                {pagination.hasMore && (
                  <Pressable
                    style={[appStyles.submitBtn, {
                      backgroundColor: '#f1f5f9',
                      marginTop: 16,
                      opacity: loadingMore ? 0.6 : 1,
                    }]}
                    onPress={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? <ActivityIndicator color="#3b82f6" />
                      : <Text style={[appStyles.submitBtnText, { color: '#3b82f6' }]}>
                          {t("common.buttons.load_more")}
                        </Text>
                    }
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}