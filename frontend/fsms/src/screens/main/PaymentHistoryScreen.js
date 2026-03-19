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

export default function PaymentHistoryScreen() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        api.getPaymentHistory({ limit: 10, offset: 0 }),
        api.getPaymentStats()
      ]);

      setPayments(historyResponse.data.payments);
      setPagination(historyResponse.data.pagination);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error loading payment history:', err);
      notifyError(err.message || t("messages.error.loading_data"));
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        api.getPaymentHistory({ limit: 10, offset: 0 }),
        api.getPaymentStats()
      ]);

      setPayments(historyResponse.data.payments);
      setPagination(historyResponse.data.pagination);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error refreshing:', err);
      notifyError(err.message || t("messages.error.loading_data"));
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
      console.error('Error loading more:', err);
      notifyError(err.message || t("messages.error.loading_data"));
    } finally {
      setLoadingMore(false);
    }
  }

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
      'applied': '#10b981',
      'pending': '#f59e0b',
      'failed': '#ef4444',
      'cancelled': '#64748b'
    };
    return colors[status?.toLowerCase()] || '#64748b';
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 16, color: '#64748b' }}>
            {t("common.loading")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 16, width: '100%' }}>
          {/* Header */}
          <Text style={appStyles.title}>{t("payments.payments_history")}</Text>
          <Text style={appStyles.subtitle}>
            {t("payments.last_payments_registered")}
          </Text>

          {/* Stats Card */}
          {stats && (
            <View style={{ 
              marginTop: 16, 
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              width: '100%'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <View style={{ minWidth: 150, flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#e0f2fe', marginBottom: 4 }}>
                    {t("payments.total_paid")}
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>
                    {formatCurrency(stats.total_paid || 0, stats.currency || 'MXN')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 150 }}>
                  <Text style={{ fontSize: 12, color: '#e0f2fe', marginBottom: 4 }}>
                    {t("payments.payments_made")}
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>
                    {stats.total_payments || 0}
                  </Text>
                </View>
              </View>
              
              {stats.last_payment_date && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#60a5fa' }}>
                  <Text style={{ fontSize: 11, color: '#e0f2fe' }}>
                    {t("payments.last_payment")}: {formatDate(stats.last_payment_date)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Payment List */}
          <View style={{ marginTop: 24, width: '100%' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              {t("payments.last_pl")} {pagination.limit} {t("payments.title").toLowerCase}
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
                width: '100%'
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
                    width: '100%'
                  }}>
                    {/* Header */}
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
                          backgroundColor: getStatusColor(payment.status) + '15',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4
                        }}>
                          <Text style={{ 
                            fontSize: 11, 
                            fontWeight: '600',
                            color: getStatusColor(payment.status)
                          }}>
                            {t("payments."+payment.status.toLowerCase())}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Amount */}
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#10b981', marginBottom: 8 }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </Text>

                    {/* Details */}
                    <View style={{ gap: 4 }}>
                      {payment.income_type_name && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>{t("payments.type")}: </Text>
                          <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '500' }}>
                            {t("payments."+payment.income_type_name.toLowerCase())}
                          </Text>
                        </View>
                      )}
                      
                      {payment.income_method && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>{t("payments.payment_method")}: </Text>
                          <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: '500' }}>
                            {t("payments."+payment.income_method.toLowerCase())}
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

                {/* Load More Button */}
                {pagination.hasMore && (
                  <Pressable
                    style={[appStyles.submitBtn, { 
                      backgroundColor: '#f1f5f9',
                      marginTop: 16,
                      opacity: loadingMore ? 0.6 : 1,
                      width: '100%'
                    }]}
                    onPress={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <ActivityIndicator color="#3b82f6" />
                    ) : (
                      <Text style={[appStyles.submitBtnText, { color: '#3b82f6' }]}>
                        {t("common.buttons.load_more")}
                      </Text>
                    )}
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