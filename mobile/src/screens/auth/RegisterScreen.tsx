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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 30) {
      newErrors.username = 'Username cannot exceed 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.username.trim(),
        formData.firstName.trim() || undefined,
        formData.lastName.trim() || undefined
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      const saveCurrentScreen = async () => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_current_screen', 'Register');
          } else {
            await AsyncStorage.setItem('auth_current_screen', 'Register');
          }
        } catch (error) {
          console.log('Failed to save current screen');
        }
      };
      saveCurrentScreen();
    }, [])
  );

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    inputContainer: {
      marginBottom: 20,
      flex: 1,
    },
    label: {
      fontSize: 14,
      color: '#374151',
      marginBottom: 8,
      fontWeight: '500',
    },
    requiredLabel: {
      color: '#002D74',
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
    inputError: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2',
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
    errorText: {
      color: '#ef4444',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
      fontWeight: '500',
    },
    passwordRequirements: {
      marginTop: 8,
      paddingHorizontal: 4,
    },
    requirementText: {
      fontSize: 11,
      color: '#6b7280',
      lineHeight: 16,
      fontWeight: '400',
    },
    registerButton: {
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 24,
      width: '100%',
    },
    registerButtonDisabled: {
      backgroundColor: '#9ca3af',
    },
    registerButtonText: {
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
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    loginText: {
      color: '#000000',
      fontSize: 14,
      flex: 1,
    },
    loginButton: {
      backgroundColor: '#ffffff',
      borderColor: '#60a5fa',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 20,
      marginLeft: 12,
    },
    loginButtonText: {
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

  const isFormValid = () => {
    return formData.email.trim() && 
           formData.username.trim() && 
           formData.password && 
           formData.confirmPassword &&
           Object.keys(errors).length === 0;
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <View style={styles.formSection}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>Create your account to start analyzing trading charts</Text>
              
              <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="Optional"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  textContentType="givenName"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Optional"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  textContentType="familyName"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, styles.requiredLabel]}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, styles.requiredLabel]}>Username *</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="Choose a username"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, styles.requiredLabel]}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  placeholder="Create a strong password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementText}>
                  Must contain: 8+ characters, uppercase, lowercase, and number
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, styles.requiredLabel]}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                (!isFormValid() || isLoading) && styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
              </View>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
                  <Text style={styles.loginButtonText}>Sign In</Text>
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

export default RegisterScreen;