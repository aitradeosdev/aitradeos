import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface BankAccountDetails {
  accountNumber: string;
  bankName: string;
  accountName: string;
  sortCode?: string;
  reference: string;
}

interface PaymentRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  bankDetails: BankAccountDetails;
  expiresAt: string;
  createdAt: string;
  reference: string;
}

interface PaymentContextType {
  // State
  currentPaymentRequest: PaymentRequest | null;
  isLoading: boolean;
  error: string | null;
  
  // Payment flow methods
  initiatePayment: (plan: 'premium') => Promise<PaymentRequest | null>;
  confirmPayment: (paymentId: string) => Promise<boolean>;
  checkPaymentStatus: (paymentId: string) => Promise<PaymentRequest | null>;
  cancelPayment: (paymentId: string) => Promise<boolean>;
  
  // Utility methods
  clearPaymentRequest: () => void;
  refreshPaymentStatus: () => Promise<void>;
  
  // Payment configuration
  getPremiumPricing: () => { amount: number; currency: string; period: string };
  formatCurrency: (amount: number, currency: string) => string;
  getTimeRemaining: (expiresAt: string) => { minutes: number; seconds: number; expired: boolean };
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for any existing pending payment when the context loads
  useEffect(() => {
    if (user) {
      checkForPendingPayment();
    }
  }, [user]);

  const setLoadingState = (loading: boolean, errorMessage: string | null = null) => {
    setIsLoading(loading);
    setError(errorMessage);
  };

  const checkForPendingPayment = async () => {
    try {
      const response = await apiService.getPendingPayment();
      if (response.data.success && response.data.paymentRequest) {
        const payment = response.data.paymentRequest;
        
        // Check if payment is expired
        if (new Date(payment.expiresAt) < new Date()) {
          setCurrentPaymentRequest(null);
        } else {
          setCurrentPaymentRequest(payment);
        }
      }
    } catch (error) {
      console.log('No pending payment found or error checking:', error);
      setCurrentPaymentRequest(null);
    }
  };

  const initiatePayment = async (plan: 'premium'): Promise<PaymentRequest | null> => {
    try {
      setLoadingState(true);
      
      const response = await apiService.initiatePayment({ plan });
      
      if (response.data.success) {
        const paymentRequest = response.data.paymentRequest;
        setCurrentPaymentRequest(paymentRequest);
        
        addNotification({
          title: 'Payment Initiated',
          message: 'Please complete your bank transfer to upgrade to Premium.',
          type: 'info'
        });
        
        return paymentRequest;
      } else {
        throw new Error(response.data.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to initiate payment';
      setLoadingState(false, errorMessage);
      
      Alert.alert('Payment Error', errorMessage);
      return null;
    } finally {
      setLoadingState(false);
    }
  };

  const confirmPayment = async (paymentId: string): Promise<boolean> => {
    try {
      setLoadingState(true);
      
      const response = await apiService.confirmPayment(paymentId);
      
      if (response.data.success) {
        addNotification({
          title: 'Payment Confirmation Sent',
          message: 'Your payment confirmation has been sent for admin approval.',
          type: 'success'
        });
        
        // Update payment request status
        if (currentPaymentRequest && currentPaymentRequest.id === paymentId) {
          setCurrentPaymentRequest({
            ...currentPaymentRequest,
            status: 'confirmed'
          });
        }
        
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to confirm payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to confirm payment';
      setLoadingState(false, errorMessage);
      
      Alert.alert('Confirmation Error', errorMessage);
      return false;
    } finally {
      setLoadingState(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string): Promise<PaymentRequest | null> => {
    try {
      const response = await apiService.getPaymentStatus(paymentId);
      
      if (response.data.payment) {
        const payment = response.data.payment;
        
        // Update current payment request if it matches
        if (currentPaymentRequest && currentPaymentRequest.reference === payment.reference) {
          const updatedPayment = {
            ...currentPaymentRequest,
            status: payment.status
          };
          setCurrentPaymentRequest(updatedPayment);
          
          // If payment was confirmed, refresh user data
          if (payment.status === 'confirmed') {
            await refreshUser();
            setCurrentPaymentRequest(null); // Clear completed payment
            
            addNotification({
              title: 'Payment Approved!',
              message: 'Welcome to Premium! Your account has been upgraded.',
              type: 'success'
            });
          }
        }
        
        return payment;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  };

  const cancelPayment = async (paymentId: string): Promise<boolean> => {
    try {
      setLoadingState(true);
      
      const response = await apiService.cancelPayment(paymentId);
      
      if (response.data.success) {
        setCurrentPaymentRequest(null);
        
        addNotification({
          title: 'Payment Cancelled',
          message: 'Your payment request has been cancelled.',
          type: 'info'
        });
        
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to cancel payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to cancel payment';
      setLoadingState(false, errorMessage);
      
      Alert.alert('Cancellation Error', errorMessage);
      return false;
    } finally {
      setLoadingState(false);
    }
  };

  const clearPaymentRequest = () => {
    setCurrentPaymentRequest(null);
    setError(null);
  };

  const refreshPaymentStatus = async () => {
    if (currentPaymentRequest) {
      await checkPaymentStatus(currentPaymentRequest.id);
    }
  };

  const getPremiumPricing = () => {
    return {
      amount: 500000, // ₦5,000.00 in kobo (default from backend)
      currency: 'NGN',
      period: 'monthly'
    };
  };

  const formatCurrency = (amount: number, currency: string): string => {
    if (currency === 'NGN') {
      const naira = amount / 100; // Convert from kobo to naira
      return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Fallback for other currencies
    return `${currency} ${(amount / 100).toLocaleString()}`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }
    
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return { minutes, seconds, expired: false };
  };

  const contextValue: PaymentContextType = {
    // State
    currentPaymentRequest,
    isLoading,
    error,
    
    // Payment flow methods
    initiatePayment,
    confirmPayment,
    checkPaymentStatus,
    cancelPayment,
    
    // Utility methods
    clearPaymentRequest,
    refreshPaymentStatus,
    
    // Payment configuration
    getPremiumPricing,
    formatCurrency,
    getTimeRemaining,
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;