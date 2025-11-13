import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { LinearGradient } from 'expo-linear-gradient';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalAnalyses: number;
}

interface PaymentRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'confirmed' | 'approved' | 'rejected';
  reference: string;
  createdAt: string;
  expiresAt: string;
}

const AdminOverviewScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadPaymentRequests();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentRequests = async () => {
    try {
      setIsLoadingPayments(true);
      const response = await apiService.getAdminPayments({ 
        status: 'confirmed', 
        limit: 5 
      });
      if (response.data.success) {
        setPaymentRequests(response.data.payments || []);
      }
    } catch (error: any) {
      console.error('Failed to load payment requests:', error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      setProcessingPaymentId(paymentId);
      const response = await apiService.approvePayment(paymentId);
      
      if (response.data.success) {
        Alert.alert('Success', 'Payment approved successfully');
        loadPaymentRequests(); // Reload the list
        loadStats(); // Reload stats to update premium users count
      } else {
        Alert.alert('Error', response.data.error || 'Failed to approve payment');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to approve payment');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    Alert.alert(
      'Reject Payment',
      'Are you sure you want to reject this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingPaymentId(paymentId);
              const response = await apiService.rejectPayment(paymentId, 'Rejected by admin');
              
              if (response.data.success) {
                Alert.alert('Success', 'Payment rejected');
                loadPaymentRequests(); // Reload the list
              } else {
                Alert.alert('Error', response.data.error || 'Failed to reject payment');
              }
            } catch (error: any) {
              Alert.alert('Error', 'Failed to reject payment');
            } finally {
              setProcessingPaymentId(null);
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number, currency: string): string => {
    if (currency === 'NGN') {
      const naira = amount / 100;
      return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currency} ${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      flex: 1,
      minWidth: '45%',
      borderWidth: 1,
      borderColor: theme.border,
    },
    gradientCard: {
      borderRadius: 16,
      padding: 20,
      flex: 1,
      minWidth: '45%',
    },
    statValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    statValueWhite: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    statLabelWhite: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: theme.textSecondary,
      marginTop: 16,
      fontSize: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
      marginTop: 24,
    },
    paymentCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    paymentUser: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    paymentAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
    },
    paymentDetails: {
      marginBottom: 16,
    },
    paymentDetail: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    paymentDetailLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    paymentDetailValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    paymentActions: {
      flexDirection: 'row',
      gap: 12,
    },
    approveButton: {
      flex: 1,
      backgroundColor: '#10B981',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    rejectButton: {
      flex: 1,
      backgroundColor: '#EF4444',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.5,
    },
    emptyPaymentsText: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: 16,
      padding: 20,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Overview</Text>
          <Text style={styles.subtitle}>System statistics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Overview</Text>
        <Text style={styles.subtitle}>System statistics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stats && (
          <View style={styles.statsGrid}>
            <LinearGradient
              colors={['#00D4FF', '#0099CC']}
              style={styles.gradientCard}
            >
              <Text style={styles.statValueWhite}>{stats.totalUsers}</Text>
              <Text style={styles.statLabelWhite}>Total Users</Text>
            </LinearGradient>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.premiumUsers}</Text>
              <Text style={styles.statLabel}>Premium Users</Text>
            </View>

            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.gradientCard}
            >
              <Text style={styles.statValueWhite}>{stats.totalAnalyses}</Text>
              <Text style={styles.statLabelWhite}>Total Analyses</Text>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ marginTop: 24, marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.primary,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('AdminPaymentConfig' as never)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Payment Config</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#10B981',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('AdminContactConfig' as never)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Contact Config</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Management Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Payment Requests</Text>
        </View>
        
        {isLoadingPayments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>Loading payments...</Text>
          </View>
        ) : paymentRequests.length === 0 ? (
          <Text style={styles.emptyPaymentsText}>No pending payment confirmations</Text>
        ) : (
          paymentRequests.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View>
                  <Text style={styles.paymentUser}>{payment.username}</Text>
                  <Text style={styles.paymentAmount}>
                    {formatAmount(payment.amount, payment.currency)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Plan:</Text>
                  <Text style={styles.paymentDetailValue}>
                    {payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}
                  </Text>
                </View>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Reference:</Text>
                  <Text style={styles.paymentDetailValue}>{payment.reference}</Text>
                </View>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Date:</Text>
                  <Text style={styles.paymentDetailValue}>{formatDate(payment.createdAt)}</Text>
                </View>
                <View style={styles.paymentDetail}>
                  <Text style={styles.paymentDetailLabel}>Status:</Text>
                  <Text style={styles.paymentDetailValue}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.paymentActions}>
                <TouchableOpacity
                  style={[
                    styles.approveButton,
                    processingPaymentId === payment.id && styles.disabledButton
                  ]}
                  onPress={() => handleApprovePayment(payment.id)}
                  disabled={processingPaymentId === payment.id}
                >
                  {processingPaymentId === payment.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Approve</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.rejectButton,
                    processingPaymentId === payment.id && styles.disabledButton
                  ]}
                  onPress={() => handleRejectPayment(payment.id)}
                  disabled={processingPaymentId === payment.id}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default AdminOverviewScreen;