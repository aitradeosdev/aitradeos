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
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const AdminSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
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
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
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
      <View style={styles.header}>
        <Text style={styles.title}>Admin Settings</Text>
        <Text style={styles.subtitle}>System configuration</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          {!showPasswordForm ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowPasswordForm(true)}>
              <Text style={styles.actionButtonText}>Change Password</Text>
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
                <TouchableOpacity style={styles.actionButton} onPress={changePassword}>
                  <Text style={styles.actionButtonText}>Update Password</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#6B7280' }]} 
                  onPress={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={initializeDatabase}>
            <Text style={styles.actionButtonText}>Initialize Database</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F59E0B' }]} onPress={restartServer}>
            <Text style={styles.actionButtonText}>Restart Backend</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#EF4444' }]} onPress={handleLogout}>
            <Text style={styles.actionButtonText}>Logout</Text>
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