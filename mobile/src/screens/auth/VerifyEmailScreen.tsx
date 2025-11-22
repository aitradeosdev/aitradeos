import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiService } from '../../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VerifyEmailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params as { email: string };
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post('/auth/verify-email', { email, otp });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('huntr_ai_token', token);
      await AsyncStorage.setItem('huntr_ai_user', JSON.stringify(user));
      apiService.setAuthToken(token);
      
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Verification Failed', error.response?.data?.error || 'Invalid or expired code');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await apiService.post('/auth/resend-otp', { email });
      Alert.alert('Success', 'Verification code sent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.backgroundContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardContainer}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {email}
            </Text>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              
              <TouchableOpacity
                style={[styles.verifyButton, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify Email</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator color="#3b82f6" />
                ) : (
                  <Text style={styles.resendText}>Resend Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    minHeight: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  cardContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002D74',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#e5e7eb',
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '700',
  },
  verifyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;
