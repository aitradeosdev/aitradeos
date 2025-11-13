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
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const { theme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
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
      padding: 20,
      flexDirection: Dimensions.get('window').width > 768 ? 'row' : 'column',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      maxWidth: 768,
      alignSelf: 'center',
      width: '100%',
    },
    formSection: {
      flex: 1,
      paddingHorizontal: 20,
    },
    imageSection: {
      flex: 1,
      borderRadius: 16,
      overflow: 'hidden',
    },
    sideImage: {
      width: '100%',
      height: '100%',
      borderRadius: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#002D74',
    },
    subtitle: {
      fontSize: 14,
      color: '#002D74',
      marginTop: 16,
    },
    formContainer: {
      marginTop: 24,
    },
    inputContainer: {
      marginBottom: 20,
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
      fontSize: 16,
      color: '#111827',
      marginTop: 8,
      width: '100%',
    },
    inputFocused: {
      borderColor: '#3b82f6',
      backgroundColor: '#ffffff',
      outline: 'none',
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: 16,
      top: 14,
      padding: 4,
    },
    passwordToggleText: {
      color: '#3b82f6',
      fontSize: 14,
      fontWeight: '600',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 8,
    },
    forgotPasswordText: {
      color: '#374151',
      fontSize: 14,
      fontWeight: '600',
    },
    loginButton: {
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 24,
      width: '100%',
    },
    loginButtonDisabled: {
      backgroundColor: '#9ca3af',
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#6b7280',
    },
    dividerText: {
      marginHorizontal: 16,
      color: '#6b7280',
      fontSize: 14,
      textAlign: 'center',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    registerText: {
      color: '#000000',
      fontSize: 14,
      flex: 1,
    },
    registerButton: {
      backgroundColor: '#ffffff',
      borderColor: '#60a5fa',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 20,
      marginLeft: 12,
    },
    registerButtonText: {
      color: '#3b82f6',
      fontSize: 14,
      fontWeight: '600',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });

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
            <View style={styles.formSection}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>If you have an account, please login</Text>
              
              <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              

            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                (isLoading || !email.trim() || !password.trim()) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
              </View>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>If you don't have an account...</Text>
                <TouchableOpacity style={styles.registerButton} onPress={navigateToRegister}>
                  <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {Dimensions.get('window').width > 768 && (
              <View style={styles.imageSection}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80' }}
                  style={styles.sideImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;