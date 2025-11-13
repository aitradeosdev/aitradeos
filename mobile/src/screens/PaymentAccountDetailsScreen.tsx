import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../services/apiService';
import ClockIcon from '../components/icons/ClockIcon';
import CopyIcon from '../components/icons/CopyIcon';
import SecurityBadge from '../components/icons/SecurityBadge';

interface PaymentData {
  reference: string;
  amount: number;
  currency: string;
  plan: string;
  bankDetails: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    displayedAt: string;
    expiresAt: string;
  };
  expiresAt: string;
}

const PaymentAccountDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const data = (route.params as any)?.paymentData;
    if (data) {
      setPaymentData(data);
    } else {
      Alert.alert('Error', 'Payment data not found');
      navigation.goBack();
    }
  }, [route.params]);

  useEffect(() => {
    if (paymentData) {
      const timer = setInterval(() => {
        const now = new Date();
        const expires = new Date(paymentData.expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining('Expired');
          clearInterval(timer);
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentData]);

  const copyToClipboard = (text: string, field: string) => {
    Clipboard.setString(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleConfirmPayment = async () => {
    if (!paymentData) return;

    try {
      setIsConfirming(true);
      const response = await apiService.post(`/payment/confirm/${paymentData.reference}`);

      if (response.data.success) {
        navigation.navigate('PaymentConfirmation' as never, {
          paymentReference: paymentData.reference,
          message: response.data.message
        } as never);
      } else {
        Alert.alert('Error', response.data.error || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to confirm payment');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment request?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: cancelPayment, style: 'destructive' }
      ]
    );
  };

  const cancelPayment = async () => {
    if (!paymentData) return;

    try {
      await apiService.delete(`/payment/cancel/${paymentData.reference}`);
      Alert.alert('Cancelled', 'Payment request cancelled successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Home' as never) }
      ]);
    } catch (error: any) {
      console.error('Payment cancellation error:', error);
      Alert.alert('Error', 'Failed to cancel payment request');
    }
  };

  if (!paymentData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Complete Payment</Text>
            <Text style={styles.subtitle}>
              Transfer the exact amount to the account below
            </Text>
          </View>
        </LinearGradient>

        {/* Timer */}
        <View style={[styles.timerCard, { backgroundColor: theme.card }]}>
          <View style={styles.timerContent}>
            <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
              {timeRemaining === 'Expired' ? 'Payment Window' : 'Time Remaining'}
            </Text>
            <Text style={[styles.timerValue, { color: timeRemaining === 'Expired' ? '#FF4444' : '#667eea' }]}>
              {timeRemaining === 'Expired' ? 'Expired' : timeRemaining}
            </Text>
            {timeRemaining === 'Expired' && (
              <Text style={[styles.expiredMessage, { color: '#FF4444' }]}>
                Please contact admin if you've made payment and await confirmation
              </Text>
            )}
          </View>
          <View style={styles.timerIcon}>
            <ClockIcon size={24} color={timeRemaining === 'Expired' ? '#FF4444' : '#667eea'} />
          </View>
        </View>

        {/* Payment Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Details</Text>
          
          <DetailRow
            label="Amount"
            value={formatAmount(paymentData.amount, paymentData.currency)}
            theme={theme}
            copyable={false}
            highlight={true}
          />
          
          <DetailRow
            label="Reference"
            value={paymentData.reference}
            theme={theme}
            copyable={true}
            onCopy={() => copyToClipboard(paymentData.reference, 'reference')}
            copied={copiedField === 'reference'}
          />
          
          <DetailRow
            label="Plan"
            value={paymentData.plan.charAt(0).toUpperCase() + paymentData.plan.slice(1)}
            theme={theme}
            copyable={false}
          />
        </View>

        {/* Bank Details */}
        <View style={[styles.bankCard, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={styles.bankGradient}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Bank Account Details</Text>
            
            <DetailRow
              label="Bank Name"
              value={paymentData.bankDetails.bankName}
              theme={theme}
              copyable={true}
              onCopy={() => copyToClipboard(paymentData.bankDetails.bankName, 'bank')}
              copied={copiedField === 'bank'}
            />
            
            <DetailRow
              label="Account Name"
              value={paymentData.bankDetails.accountName}
              theme={theme}
              copyable={true}
              onCopy={() => copyToClipboard(paymentData.bankDetails.accountName, 'name')}
              copied={copiedField === 'name'}
            />
            
            <DetailRow
              label="Account Number"
              value={paymentData.bankDetails.accountNumber}
              theme={theme}
              copyable={true}
              onCopy={() => copyToClipboard(paymentData.bankDetails.accountNumber, 'account')}
              copied={copiedField === 'account'}
              highlight={true}
            />
          </LinearGradient>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Instructions</Text>
          
          <View style={styles.instructionsList}>
            <InstructionItem
              number={1}
              text="Transfer the exact amount to the account above"
              theme={theme}
            />
            <InstructionItem
              number={2}
              text="Use the payment reference in your transfer description"
              theme={theme}
            />
            <InstructionItem
              number={3}
              text="Click 'Payment Made' after completing the transfer"
              theme={theme}
            />
            <InstructionItem
              number={4}
              text="Wait for admin confirmation (usually within 24 hours)"
              theme={theme}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, isConfirming && styles.buttonDisabled]}
            onPress={handleConfirmPayment}
            disabled={isConfirming}
          >
            <LinearGradient
              colors={isConfirming ? ['#ccc', '#999'] : ['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              {isConfirming ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Payment Made</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.border }]}
            onPress={handleCancelPayment}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
              Cancel Payment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <View style={styles.securityBadgeContainer}>
            <SecurityBadge size={32} />
            <View style={styles.securityTextContainer}>
              <Text style={[styles.securityTitle, { color: theme.text }]}>Secured by Huntr AI</Text>
              <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                Never share your payment details with unauthorized parties.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string;
  theme: any;
  copyable: boolean;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
}> = ({ label, value, theme, copyable, onCopy, copied, highlight }) => (
  <View style={[styles.detailRow, highlight && styles.highlightRow]}>
    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
    <View style={styles.detailValueContainer}>
      <Text style={[styles.detailValue, { color: theme.text }, highlight && styles.highlightValue]}>
        {value}
      </Text>
      {copyable && (
        <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
          {copied ? (
            <Text style={[styles.copyButtonText, { color: '#4CAF50' }]}>✓</Text>
          ) : (
            <CopyIcon size={16} color={theme.primary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const InstructionItem: React.FC<{
  number: number;
  text: string;
  theme: any;
}> = ({ number, theme, text }) => (
  <View style={styles.instructionItem}>
    <View style={[styles.instructionNumber, { backgroundColor: theme.primary }]}>
      <Text style={styles.instructionNumberText}>{number}</Text>
    </View>
    <Text style={[styles.instructionText, { color: theme.text }]}>{text}</Text>
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timerCard: {
    marginHorizontal: 24,
    marginTop: -15,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  timerContent: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  expiredMessage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'left',
  },
  timerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsCard: {
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
  bankCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  bankGradient: {
    padding: 24,
  },
  instructionsCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  highlightRow: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  copyButtonText: {
    fontSize: 16,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 24,
    gap: 12,
  },
  confirmButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  securityNotice: {
    padding: 24,
    paddingTop: 0,
  },
  securityBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  securityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default PaymentAccountDetailsScreen;