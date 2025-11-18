import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import KeyIcon from '../../components/icons/KeyIcon';
import DevicesIcon from '../../components/icons/DevicesIcon';
import UserSwitchIcon from '../../components/icons/UserSwitchIcon';
import TrashIcon from '../../components/icons/TrashIcon';

interface UserDetailsScreenProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

interface UserDetails {
  _id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  apiUsage: {
    totalAnalyses: number;
    lastAnalysis: string;
  };
  devices: Array<{
    deviceId: string;
    name: string;
    lastActive: string;
    platform: string;
  }>;
}

const UserDetailsScreen: React.FC<UserDetailsScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { userId } = route.params;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordModal, setPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successModal, setSuccessModal] = useState<{visible: boolean; message: string}>({visible: false, message: ''});
  const [roleModal, setRoleModal] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/admin/users/${userId}`);
      setUser(response.data.user);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load user details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (Platform.OS === 'web') {
      setPasswordModal(true);
    } else {
      Alert.prompt(
        'Change Password',
        'Enter new password for this user:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: async (password) => {
              await submitPasswordChange(password);
            }
          }
        ],
        'secure-text'
      );
    }
  };

  const submitPasswordChange = async (password: string) => {
    if (!password || password.length < 6) {
      if (Platform.OS === 'web') {
        alert('Password must be at least 6 characters');
      } else {
        Alert.alert('Error', 'Password must be at least 6 characters');
      }
      return;
    }
    try {
      await apiService.put(`/admin/users/${userId}/password`, { newPassword: password });
      setPasswordModal(false);
      setNewPassword('');
      
      if (Platform.OS === 'web') {
        alert('Password changed successfully');
      } else {
        Alert.alert('Success', 'Password changed successfully');
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert('Failed to change password');
      } else {
        Alert.alert('Error', 'Failed to change password');
      }
    }
  };



  const showRoleConfirm = () => {
    setRoleModal(true);
  };

  const toggleRole = async () => {
    if (!user) return;
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await apiService.put(`/admin/users/${userId}/role`, { role: newRole });
      setRoleModal(false);
      setSuccessModal({visible: true, message: `User role updated to ${newRole}`});
      loadUserDetails();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update role');
    }
  };

  const deleteUser = async () => {
    Alert.alert(
      'Delete User',
      `Delete user "${user?.username}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      marginBottom: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
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
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    detailValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
    },
    actionIcon: {
      width: 20,
      height: 20,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionText: {
      fontSize: 16,
      color: theme.text,
      flex: 1,
    },
    dangerButton: {
      backgroundColor: '#FEF2F2',
    },
    dangerText: {
      color: '#DC2626',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    passwordInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
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
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    confirmButton: {
      backgroundColor: theme.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.text,
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
    successModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    successModalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 350,
      alignItems: 'center',
    },
    successIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    successTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#10B981',
      marginBottom: 8,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    successButton: {
      backgroundColor: '#10B981',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    successButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>User Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{user.username}</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>{user.profile?.firstName} {user.profile?.lastName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{user.role}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>{user.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Joined</Text>
            <Text style={styles.detailValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Statistics</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Analyses</Text>
            <Text style={styles.detailValue}>{user.apiUsage?.totalAnalyses || 0}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Analysis</Text>
            <Text style={styles.detailValue}>
              {user.apiUsage?.lastAnalysis ? new Date(user.apiUsage.lastAnalysis).toLocaleDateString() : 'Never'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={showRoleConfirm}>
            <View style={styles.actionIcon}>
              <UserSwitchIcon size={20} color={theme.text} />
            </View>
            <Text style={styles.actionText}>
              {user.role === 'admin' ? 'Remove Admin Role' : 'Grant Admin Role'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={changePassword}>
            <View style={styles.actionIcon}>
              <KeyIcon size={20} color={theme.text} />
            </View>
            <Text style={styles.actionText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('UserDevices', { userId, username: user?.username })}>
            <View style={styles.actionIcon}>
              <DevicesIcon size={20} color={theme.text} />
            </View>
            <Text style={styles.actionText}>Manage Devices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={deleteUser}>
            <View style={styles.actionIcon}>
              <TrashIcon size={20} color="#DC2626" />
            </View>
            <Text style={[styles.actionText, styles.dangerText]}>Delete User Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={passwordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter new password"
              placeholderTextColor={theme.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setPasswordModal(false);
                  setNewPassword('');
                }}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => submitPasswordChange(newPassword)}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModal({visible: false, message: ''})}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successMessage}>{successModal.message}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessModal({visible: false, message: ''})}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={roleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{marginBottom: 16, alignItems: 'center'}}>
              <UserSwitchIcon size={48} color={theme.primary} />
            </View>
            <Text style={styles.modalTitle}>Change User Role</Text>
            <Text style={styles.modalMessage}>
              {user?.role === 'admin' 
                ? `Remove admin privileges from ${user?.username}? They will become a regular user.`
                : `Grant admin privileges to ${user?.username}? They will have full administrative access.`
              }
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRoleModal(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={toggleRole}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  {user?.role === 'admin' ? 'Remove Admin' : 'Grant Admin'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserDetailsScreen;