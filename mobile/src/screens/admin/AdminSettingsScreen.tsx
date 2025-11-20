import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import AdminHeader from '../../components/AdminHeader';

const AdminSettingsScreen: React.FC = () => {
  const { theme } = useTheme();


  const [envVars, setEnvVars] = useState<any>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadEnvVars();
  }, []);

  const loadEnvVars = async () => {
    try {
      const response = await apiService.getEnvVars();
      setEnvVars(response.data.envVars);
    } catch (error) {
      Alert.alert('Error', 'Failed to load environment variables');
    }
  };

  const updateEnvVar = async (key: string, value: string) => {
    try {
      await apiService.updateEnvVar(key, value);
      Alert.alert('Success', `${key} updated successfully`);
      loadEnvVars();
      setEditingKey(null);
      setEditValue('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update environment variable');
    }
  };

  const restartServer = async () => {
    try {
      await apiService.post('/admin/restart');
      Alert.alert('Success', 'Server is restarting...');
    } catch (error) {
      Alert.alert('Error', 'Failed to restart server');
    }
  };

  const initializeDatabase = async () => {
    Alert.alert(
      'Initialize Database',
      'This will fix any users missing the isActive field. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Initialize',
          onPress: async () => {
            try {
              const response = await apiService.post('/admin/init-database');
              Alert.alert('Success', `Database initialized. Fixed ${response.data.stats.usersFixed} users.`);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to initialize database');
            }
          }
        }
      ]
    );
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    try {
      await apiService.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      Alert.alert('Success', 'Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
    }
  };



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    envItem: {
      marginBottom: 12,
    },
    envKey: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    envValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    envValue: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
    },
    envEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    envInput: {
      flex: 1,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.text,
    },
    button: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionButtonText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '500',
    },
    actionButtonDanger: {
      backgroundColor: '#FEF2F2',
      borderColor: '#FEE2E2',
    },
    actionButtonWarning: {
      backgroundColor: '#FFFBEB',
      borderColor: '#FEF3C7',
    },
    actionButtonTextDanger: {
      color: '#DC2626',
    },
    actionButtonTextWarning: {
      color: '#D97706',
    },
    passwordForm: {
      gap: 12,
    },
    passwordInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    passwordButtons: {
      flexDirection: 'row',
      gap: 12,
    },
  });

  return (
    <View style={styles.container}>
      <AdminHeader title="Advanced Settings" subtitle="System configuration" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          {!showPasswordForm ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowPasswordForm(true)}>
              <Text style={styles.actionButtonText}>Change Password</Text>
              <Text style={{ fontSize: 18 }}>→</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.passwordForm}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current Password"
                placeholderTextColor={theme.textSecondary}
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({...passwordForm, currentPassword: text})}
                secureTextEntry
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                placeholderTextColor={theme.textSecondary}
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({...passwordForm, newPassword: text})}
                secureTextEntry
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm New Password"
                placeholderTextColor={theme.textSecondary}
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({...passwordForm, confirmPassword: text})}
                secureTextEntry
              />
              <View style={styles.passwordButtons}>
                <TouchableOpacity 
                  style={[styles.button, { flex: 1, paddingVertical: 12, alignItems: 'center' }]} 
                  onPress={changePassword}
                >
                  <Text style={styles.buttonText}>Update Password</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#6B7280' }]} 
                  onPress={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={initializeDatabase}>
            <Text style={styles.actionButtonText}>Initialize Database</Text>
            <Text style={{ fontSize: 18 }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonWarning]} onPress={restartServer}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextWarning]}>Restart Backend</Text>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          {Object.entries(envVars).map(([key, value]) => (
            <View key={key} style={styles.envItem}>
              <Text style={styles.envKey}>{key}</Text>
              {editingKey === key ? (
                <View style={styles.envEditRow}>
                  <TextInput
                    style={styles.envInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder="Enter new value"
                    secureTextEntry
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => updateEnvVar(key, editValue)}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.error }]}
                    onPress={() => {
                      setEditingKey(null);
                      setEditValue('');
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.envValueRow}>
                  <Text style={styles.envValue}>{value as string}</Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setEditingKey(key);
                      setEditValue('');
                    }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminSettingsScreen;