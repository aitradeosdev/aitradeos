import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';

interface Payment {
  id: string;
  userId: string;
  reference: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'confirmed' | 'rejected';
  requestedAt: string;
  confirmedAt?: string;
  adminNotes?: string;
  username: string;
  userEmail: string;
  userName: string;
}

const AdminPaymentsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadPayments();
  }, [selectedStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await apiService.getAdminPayments(params);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handlePaymentAction = (payment: Payment, action: 'approve' | 'reject') => {
    setSelectedPayment(payment);
    setActionType(action);
    setAdminNotes('');
    setActionModalVisible(true);
  };

  const confirmPaymentAction = async () => {
    if (!selectedPayment) return;

    try {
      if (actionType === 'approve') {
        await apiService.approvePayment(selectedPayment.id);
        Alert.alert('Success', 'Payment approved successfully');
      } else {
        await apiService.rejectPayment(selectedPayment.id, adminNotes || 'Rejected by admin');
        Alert.alert('Success', 'Payment rejected');
      }
      
      setActionModalVisible(false);
      setSelectedPayment(null);
      setAdminNotes('');
      await loadPayments();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || `Failed to ${actionType} payment`);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${(amount / 100).toLocaleString()}`;
    }
    return `${currency} ${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'rejected': return '#FF4444';
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const statusFilters = [
    { key: 'all', label: 'All Payments' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' }
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    filterContainer: {
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    filterScrollView: {
      flexDirection: 'row',
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    paymentCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentReference: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    paymentUser: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    paymentAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    paymentDetails: {
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    detailValue: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '500',
    },
    adminNotes: {
      backgroundColor: theme.surface,
      padding: 8,
      borderRadius: 8,
      marginBottom: 12,
    },
    adminNotesText: {
      fontSize: 12,
      color: theme.text,
      fontStyle: 'italic',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    approveButton: {
      backgroundColor: '#4CAF50',
    },
    rejectButton: {
      backgroundColor: '#FF4444',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
      textAlign: 'center',
    },
    notesInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.text,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalButtonConfirm: {
      backgroundColor: theme.primary,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    modalButtonTextCancel: {
      color: theme.text,
    },
    modalButtonTextConfirm: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Management</Text>
        <Text style={styles.subtitle}>Review and manage payment requests</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedStatus === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading payments...' : 'No payments found'}
            </Text>
          </View>
        ) : (
          payments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentReference}>#{payment.reference}</Text>
                  <Text style={styles.paymentUser}>{payment.userName} ({payment.userEmail})</Text>
                  <Text style={styles.paymentAmount}>
                    {formatAmount(payment.amount, payment.currency)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusIcon(payment.status)} {payment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Plan:</Text>
                  <Text style={styles.detailValue}>{payment.plan.toUpperCase()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Requested:</Text>
                  <Text style={styles.detailValue}>{formatDate(payment.requestedAt)}</Text>
                </View>
                {payment.confirmedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {payment.status === 'confirmed' ? 'Approved:' : 'Updated:'}
                    </Text>
                    <Text style={styles.detailValue}>{formatDate(payment.confirmedAt)}</Text>
                  </View>
                )}
              </View>

              {payment.adminNotes && (
                <View style={styles.adminNotes}>
                  <Text style={styles.adminNotesText}>Note: {payment.adminNotes}</Text>
                </View>
              )}

              {payment.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handlePaymentAction(payment, 'approve')}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handlePaymentAction(payment, 'reject')}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </Text>
            <Text style={styles.modalText}>
              {actionType === 'approve' 
                ? 'This will upgrade the user to Premium and activate their subscription.'
                : 'This will reject the payment request. Please provide a reason.'
              }
            </Text>
            
            {actionType === 'reject' && (
              <TextInput
                style={styles.notesInput}
                placeholder="Reason for rejection (optional)"
                placeholderTextColor={theme.textSecondary}
                value={adminNotes}
                onChangeText={setAdminNotes}
                multiline
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmPaymentAction}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminPaymentsScreen;