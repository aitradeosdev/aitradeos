import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { apiService } from '../services/apiService';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, updateSettings, logout } = useAuth();
  const { setAdminMode } = useAdmin();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    username: user?.username || ''
  });
  
  const [settingsForm, setSettingsForm] = useState({
    allowDataTraining: user?.settings?.allowDataTraining ?? true,
    notifications: user?.settings?.notifications ?? true,
    theme: user?.settings?.theme || 'dark',
    aiModel: user?.settings?.aiModel || 'gemini-2.5-flash'
  });
  
  // Update form when user data changes (only on initial load)
  React.useEffect(() => {
    if (user?.settings && !isLoading) {
      setSettingsForm({
        allowDataTraining: user.settings.allowDataTraining ?? true,
        notifications: user.settings.notifications ?? true,
        theme: user.settings.theme || 'dark',
        aiModel: user.settings.aiModel || 'gemini-2.5-flash'
      });
    }
  }, [user?.id]); // Only trigger when user ID changes (initial load)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await updateSettings({
        allowDataTraining: settingsForm.allowDataTraining,
        notifications: settingsForm.notifications,
        theme: settingsForm.theme as 'light' | 'dark',
        aiModel: settingsForm.aiModel as 'gemini-2.5-flash' | 'gemini-2.5-pro'
      });
      Alert.alert('Success', 'Settings updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataTrainingToggle = (value: boolean) => {
    setSettingsForm(prev => ({ ...prev, allowDataTraining: value }));
  };

  const handleNotificationsToggle = (value: boolean) => {
    setSettingsForm(prev => ({ ...prev, notifications: value }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setSettingsForm(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleModelChange = (model: 'gemini-2.5-flash' | 'gemini-2.5-pro') => {
    setSettingsForm(prev => ({ ...prev, aiModel: model }));
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      setIsDeleting(true);
      await apiService.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
        { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
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
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.surface,
    },
    backButtonText: {
      color: theme.text,
      fontSize: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    saveButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.primary,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLeft: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    themeButton: {
      flex: 1,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    themeButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    themeButtonText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    themeButtonTextActive: {
      color: '#FFFFFF',
    },
    dangerSection: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.error,
    },
    deleteButton: {
      backgroundColor: theme.error,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    deleteButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.error,
      marginBottom: 12,
    },
    modalText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 20,
    },
    passwordInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    confirmButton: {
      backgroundColor: theme.error,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.text,
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
    signOutButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    signOutButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Data Training</Text>
              <Text style={styles.settingDescription}>
                Allow your analyses to help improve our AI models
              </Text>
            </View>
            <Switch
              value={settingsForm.allowDataTraining}
              onValueChange={handleDataTrainingToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settingsForm.allowDataTraining ? '#FFFFFF' : theme.textSecondary}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates about your analyses and account
              </Text>
            </View>
            <Switch
              value={settingsForm.notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settingsForm.notifications ? '#FFFFFF' : theme.textSecondary}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>
                Choose your preferred app appearance
              </Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    settingsForm.theme === 'light' && styles.themeButtonActive
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Text style={[
                    styles.themeButtonText,
                    settingsForm.theme === 'light' && styles.themeButtonTextActive
                  ]}>
                    Light
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    settingsForm.theme === 'dark' && styles.themeButtonActive
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Text style={[
                    styles.themeButtonText,
                    settingsForm.theme === 'dark' && styles.themeButtonTextActive
                  ]}>
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>AI Model</Text>
              <Text style={styles.settingDescription}>
                Choose the AI model for chart analysis
              </Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    settingsForm.aiModel === 'gemini-2.5-flash' && styles.themeButtonActive
                  ]}
                  onPress={() => handleModelChange('gemini-2.5-flash')}
                >
                  <Text style={[
                    styles.themeButtonText,
                    settingsForm.aiModel === 'gemini-2.5-flash' && styles.themeButtonTextActive
                  ]}>
                    Flash (Fast)
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    settingsForm.aiModel === 'gemini-2.5-pro' && styles.themeButtonActive
                  ]}
                  onPress={() => handleModelChange('gemini-2.5-pro')}
                >
                  <Text style={[
                    styles.themeButtonText,
                    settingsForm.aiModel === 'gemini-2.5-pro' && styles.themeButtonTextActive
                  ]}>
                    Pro (Advanced)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Device Management</Text>
              <Text style={styles.settingDescription}>
                Manage devices logged into your account
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => navigation.navigate('DeviceManagement' as never)}
            >
              <Text style={styles.signOutButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {user?.role === 'admin' && (
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Admin Dashboard</Text>
                <Text style={styles.settingDescription}>
                  Manage users and view system statistics
                </Text>
              </View>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                  setAdminMode(true);
                  navigation.goBack();
                }}
              >
                <Text style={styles.signOutButtonText}>Open</Text>
              </TouchableOpacity>
            </View>
          )}
          

          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Sign Out</Text>
              <Text style={styles.settingDescription}>
                Sign out of your account
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Delete Account</Text>
              <Text style={styles.settingDescription}>
                Permanently delete your account and all data. This action cannot be undone.
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowDeleteModal(true)}
              >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This will permanently delete your account and all associated data. This action cannot be undone.
              {"\n\n"}Please enter your password to confirm:
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;