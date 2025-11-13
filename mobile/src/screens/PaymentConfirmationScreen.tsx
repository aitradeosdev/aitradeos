import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import ClockIcon from '../components/icons/ClockIcon';
import ContactModal from '../components/ContactModal';

interface PaymentStatus {
  payment: {
    reference: string;
    amount: number;
    currency: string;
    plan: string;
    status: 'pending' | 'confirmed' | 'rejected';
    requestedAt: string;
    confirmedAt?: string;
    adminNotes?: string;
  };
}

const PaymentConfirmationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { refreshUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactConfig, setContactConfig] = useState<any>(null);

  useEffect(() => {
    const params = route.params as any;
    if (params?.paymentReference) {
      setPaymentReference(params.paymentReference);
    }
    if (params?.message) {
      setMessage(params.message);
    }
    
    loadPaymentStatus();
    loadContactConfig();
  }, [route.params]);

  const loadContactConfig = async () => {
    try {
      const response = await apiService.getUserContactConfig();
      setContactConfig(response.data.contacts);
    } catch (error) {
      console.error('Failed to load contact config:', error);
    }
  };

  const loadPaymentStatus = async () => {
    const params = route.params as any;
    const reference = params?.paymentReference;
    
    if (!reference) return;

    try {
      setIsLoading(true);
      const response = await apiService.get(`/payment/status/${reference}`);
      setPaymentStatus(response.data);
      
      // If payment is confirmed, refresh user data and navigate to success
      if (response.data.payment.status === 'confirmed') {
        await refreshUser();
        // Add a small delay to show the success state
        setTimeout(() => {
          handlePaymentSuccess();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Failed to load payment status:', error);
      Alert.alert('Error', 'Failed to check payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentStatus();
    setRefreshing(false);
  };

  const handlePaymentSuccess = () => {
    Alert.alert(
      'Payment Confirmed! 🎉',
      'Your premium subscription has been activated successfully!',
      [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('Home' as never)
        }
      ]
    );
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
      month: 'long',
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
      case 'pending': return <ClockIcon size={48} color="#FFFFFF" />;
      case 'confirmed': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Payment Under Review';
      case 'confirmed': return 'Payment Confirmed!';
      case 'rejected': return 'Payment Rejected';
      default: return 'Unknown Status';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': 
        return 'Our team is reviewing your payment. This usually takes 30 minutes to 24 hours. You will be notified once approved.';
      case 'confirmed': 
        return 'Your payment has been confirmed and your premium subscription is now active!';
      case 'rejected': 
        return 'Your payment could not be verified. Please check the details and try again or contact support.';
      default: 
        return 'Payment status could not be determined.';
    }
  };

  if (isLoading && !paymentStatus) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Checking payment status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = paymentStatus?.payment.status || 'pending';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <LinearGradient
          colors={status === 'confirmed' ? ['#4CAF50', '#2E7D32'] : status === 'rejected' ? ['#FF4444', '#D32F2F'] : ['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.statusIconContainer}>
              {typeof getStatusIcon(status) === 'string' ? (
                <Text style={styles.statusIconText}>{getStatusIcon(status)}</Text>
              ) : (
                getStatusIcon(status)
              )}
            </View>
            
            <Text style={styles.statusTitle}>
              {getStatusText(status)}
            </Text>
            
            <Text style={styles.statusDescription}>
              {getStatusDescription(status)}
            </Text>
          </View>
        </LinearGradient>

        {/* Payment Details Card */}
        {paymentStatus && (
          <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Payment Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Reference</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {paymentStatus.payment.reference}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Amount</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatAmount(paymentStatus.payment.amount, paymentStatus.payment.currency)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Plan</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {paymentStatus.payment.plan.charAt(0).toUpperCase() + paymentStatus.payment.plan.slice(1)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Submitted</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(paymentStatus.payment.requestedAt)}
              </Text>
            </View>
            
            {paymentStatus.payment.confirmedAt && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  {status === 'confirmed' ? 'Approved' : 'Updated'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatDate(paymentStatus.payment.confirmedAt)}
                </Text>
              </View>
            )}
            
            {paymentStatus.payment.adminNotes && (
              <View style={[styles.adminNotesContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.adminNotesLabel, { color: theme.textSecondary }]}>Admin Note:</Text>
                <Text style={[styles.adminNotesText, { color: theme.text }]}>
                  {paymentStatus.payment.adminNotes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* What's Next */}
        <View style={[styles.nextStepsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>What's Next?</Text>
          
          {status === 'pending' && (
            <View style={styles.stepsList}>
              <StepItem
                number={1}
                text="We've received your payment confirmation"
                completed={true}
                theme={theme}
              />
              <StepItem
                number={2}
                text="Our team is verifying your payment"
                completed={false}
                current={true}
                theme={theme}
              />
              <StepItem
                number={3}
                text="Your premium subscription will be activated"
                completed={false}
                theme={theme}
              />
            </View>
          )}

          {status === 'confirmed' && (
            <View style={styles.successMessage}>
              <Text style={[styles.successText, { color: '#4CAF50' }]}>
                🎉 Welcome to Premium! Your subscription is now active.
              </Text>
              <Text style={[styles.successSubtext, { color: theme.textSecondary }]}>
                You can now enjoy 5 analyses per day and all premium features.
              </Text>
            </View>
          )}

          {status === 'rejected' && (
            <View style={styles.rejectedMessage}>
              <Text style={[styles.rejectedText, { color: '#FF4444' }]}>
                Payment verification failed. Please try again or contact support.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.primary }]}
                onPress={onRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.refreshButtonText}>Check Status</Text>
                )}
              </TouchableOpacity>
              
              <Text style={[styles.checkLaterText, { color: theme.textSecondary }]}>
                You can also check back later or we'll notify you when it's approved
              </Text>
            </>
          )}

          {(status === 'confirmed' || status === 'rejected') && (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home' as never)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.homeButtonGradient}
              >
                <Text style={styles.homeButtonText}>
                  {status === 'confirmed' ? 'Start Using Premium' : 'Back to Home'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Support Section */}
        <View style={[styles.supportCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.supportTitle, { color: theme.text }]}>Need Help?</Text>
          <Text style={[styles.supportText, { color: theme.textSecondary }]}>
            If you have any questions about your payment or need assistance, please contact our support team.
          </Text>
          
          <TouchableOpacity 
            style={[styles.supportButton, { borderColor: theme.border }]}
            onPress={() => setShowContactModal(true)}
          >
            <Text style={[styles.supportButtonText, { color: theme.primary }]}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Contact Modal */}
      {contactConfig && (
        <ContactModal
          visible={showContactModal}
          onClose={() => setShowContactModal(false)}
          contacts={contactConfig}
        />
      )}
    </SafeAreaView>
  );
};

const StepItem: React.FC<{
  number: number;
  text: string;
  completed: boolean;
  current?: boolean;
  theme: any;
}> = ({ number, text, completed, current, theme }) => (
  <View style={[styles.stepItem, current && styles.currentStep]}>
    <View style={[
      styles.stepNumber,
      completed && { backgroundColor: '#4CAF50' },
      current && { backgroundColor: theme.primary },
      !completed && !current && { backgroundColor: theme.textSecondary }
    ]}>
      <Text style={styles.stepNumberText}>
        {completed ? '✓' : number}
      </Text>
    </View>
    <Text style={[
      styles.stepText,
      { color: current ? theme.text : theme.textSecondary },
      current && { fontWeight: '600' }
    ]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statusIconText: {
    fontSize: 48,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  statusDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  detailsCard: {
    marginHorizontal: 24,
    marginTop: -15,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  nextStepsCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  supportCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailLabel: {
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  adminNotesContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStep: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  successMessage: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  rejectedMessage: {
    paddingVertical: 8,
  },
  rejectedText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 24,
    alignItems: 'center',
  },
  refreshButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  checkLaterText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  homeButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  homeButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PaymentConfirmationScreen;