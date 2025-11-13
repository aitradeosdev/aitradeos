import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { usePayment } from '../contexts/PaymentContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import CreditCardIcon from '../components/icons/CreditCardIcon';

const PaymentSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { initiatePayment, formatCurrency, isLoading } = usePayment();
  
  const [selectedPlan, setSelectedPlan] = useState<'premium'>('premium');
  const [premiumPricing, setPremiumPricing] = useState({ amount: 500000, currency: 'NGN' });
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const response = await apiService.get('/payment/plans');
      const plans = response.data.plans;
      if (plans.premium) {
        setPremiumPricing({
          amount: plans.premium.price,
          currency: plans.premium.currency
        });
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const handleProceed = async () => {
    try {
      // Check for existing pending payment first
      const pendingResponse = await apiService.getPendingPayment();
      
      if (pendingResponse.data.success && pendingResponse.data.paymentRequest) {
        const existingPayment = pendingResponse.data.paymentRequest;
        
        // Navigate to confirmation page for existing payment
        navigation.navigate('PaymentConfirmation' as never, {
          paymentReference: existingPayment.reference,
          message: 'You have a pending payment request'
        } as never);
        return;
      }
      
      const paymentRequest = await initiatePayment(selectedPlan);
      
      if (paymentRequest) {
        navigation.navigate('PaymentAccountDetails' as never, {
          paymentData: {
            reference: paymentRequest.reference,
            amount: paymentRequest.amount / 100, // Convert from kobo to naira
            currency: paymentRequest.currency,
            plan: paymentRequest.plan,
            bankDetails: paymentRequest.bankDetails,
            expiresAt: paymentRequest.expiresAt
          }
        } as never);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerGradient: {
      paddingBottom: 20,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    backButtonText: {
      fontSize: 18,
      color: theme.text,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 17,
      color: theme.textSecondary,
      lineHeight: 24,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    currentPlanCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
      marginBottom: 32,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      position: 'relative',
      overflow: 'hidden',
    },
    currentPlanGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    currentPlanTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    currentPlanText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    planCard: {
      borderRadius: 28,
      marginBottom: 32,
      overflow: 'hidden',
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 15,
      transform: [{ scale: 1 }],
    },
    planGradient: {
      padding: 24,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    planTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    planBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    planBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    planPrice: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    planPeriod: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 20,
    },
    featuresList: {
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      fontSize: 16,
      color: '#FFFFFF',
      marginRight: 12,
      width: 20,
    },
    featureText: {
      fontSize: 16,
      color: '#FFFFFF',
      flex: 1,
      lineHeight: 22,
    },
    comparisonSection: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
      marginBottom: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
    comparisonTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    comparisonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    comparisonFeature: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
    },
    comparisonFree: {
      width: 80,
      textAlign: 'center',
      fontSize: 14,
      color: theme.textSecondary,
    },
    comparisonPremium: {
      width: 80,
      textAlign: 'center',
      fontSize: 14,
      color: theme.primary,
      fontWeight: '600',
    },
    proceedButton: {
      borderRadius: 32,
      overflow: 'hidden',
      marginBottom: 40,
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    proceedGradient: {
      paddingVertical: 20,
      paddingHorizontal: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    proceedText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    cancelButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      marginBottom: 40,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    disclaimer: {
      padding: 20,
      backgroundColor: theme.primary + '15',
      borderRadius: 16,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    disclaimerText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  const premiumFeatures = [
    'Daily Analyses: 5 vs 1',
    'Monthly Analyses: 150 vs 30', 
    'Multi-timeframe Analysis',
    'Advanced Technical Indicators',
    'Priority AI Processing',
    'Detailed Market Insights',
    'Export Analysis Reports',
    'Email Support',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock advanced features and increase your analysis limits
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Status */}
        <View style={styles.currentPlanCard}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.currentPlanGradient}
          />
          <Text style={styles.currentPlanTitle}>Current Plan: {user?.subscription?.plan || 'Free'}</Text>
          <Text style={styles.currentPlanText}>
            You've used {user?.apiUsage?.dailyAnalyses || 0} out of {user?.subscription?.plan === 'premium' ? '5' : '1'} daily analyses.
            Monthly usage: {user?.apiUsage?.monthlyAnalyses || 0} out of {user?.subscription?.plan === 'premium' ? '150' : '30'}.
          </Text>
        </View>

        {/* Premium Plan Card */}
        <TouchableOpacity 
          style={styles.planCard}
          onPress={() => setSelectedPlan('premium')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.planGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planTitle}>Premium</Text>
                {loadingPricing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.planPrice}>{formatCurrency(premiumPricing.amount, premiumPricing.currency)}</Text>
                    <Text style={styles.planPeriod}>per month</Text>
                  </>
                )}
              </View>
              <View style={styles.planBadge}>
                <CreditCardIcon size={16} color="#FFFFFF" animated={true} />
                <Text style={styles.planBadgeText}>POPULAR</Text>
              </View>
            </View>
            
            <View style={styles.featuresList}>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Feature Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Feature Comparison</Text>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>Feature</Text>
            <Text style={styles.comparisonFree}>Free</Text>
            <Text style={styles.comparisonPremium}>Premium</Text>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>Daily Analyses</Text>
            <Text style={styles.comparisonFree}>1</Text>
            <Text style={styles.comparisonPremium}>5</Text>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>Monthly Analyses</Text>
            <Text style={styles.comparisonFree}>30</Text>
            <Text style={styles.comparisonPremium}>150</Text>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>Multi-timeframe</Text>
            <Text style={styles.comparisonFree}>✗</Text>
            <Text style={styles.comparisonPremium}>✓</Text>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonFeature}>Priority Support</Text>
            <Text style={styles.comparisonFree}>✗</Text>
            <Text style={styles.comparisonPremium}>✓</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            By proceeding, you agree to our Terms of Service and acknowledge that payment will be processed via bank transfer. 
            Your subscription will be activated after payment confirmation by our team.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={handleProceed}
          disabled={isLoading || loadingPricing}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={isLoading ? ['#666', '#666'] : ['#00D4FF', '#0099CC']}
            style={styles.proceedGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.proceedText}>
                {loadingPricing ? 'Loading...' : `Proceed with Premium - ${formatCurrency(premiumPricing.amount, premiumPricing.currency)}/month`}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentSelectionScreen;