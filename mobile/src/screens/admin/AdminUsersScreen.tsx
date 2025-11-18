import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import UserIcon from '../../components/icons/UserIcon';
import ToggleIcon from '../../components/icons/ToggleIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';

interface User {
  _id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  apiUsage: {
    totalAnalyses: number;
  };
}

const AdminUsersScreen: React.FC<{navigation: any}> = ({ navigation }) => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{visible: boolean; user: User | null}>({visible: false, user: null});
  const [successModal, setSuccessModal] = useState<{visible: boolean; message: string}>({visible: false, message: ''});
  const [userModal, setUserModal] = useState<{visible: boolean; user: User | null}>({visible: false, user: null});

  useEffect(() => {
    loadUsers();
  }, []);

  // Auto-refresh every 30 seconds
  useAutoRefresh({
    onRefresh: () => {
      // Silent refresh without showing loading state
      apiService.get(`/admin/users?search=${search}`)
        .then(response => setUsers(response.data.users))
        .catch(() => {}); // Silent fail
    },
    interval: 30000,
    enabled: true
  });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/admin/users?search=${search}`);
      setUsers(response.data.users);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await apiService.put(`/admin/users/${userId}/role`, { role: newRole });
      loadUsers();
      Alert.alert('Success', `User role updated to ${newRole}`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const showDeleteModal = (user: User) => {
    setDeleteModal({visible: true, user});
  };

  const hideDeleteModal = () => {
    setDeleteModal({visible: false, user: null});
  };

  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    
    try {
      await apiService.deleteUser(deleteModal.user._id);
      hideDeleteModal();
      setSuccessModal({visible: true, message: `User ${deleteModal.user.username} deleted successfully`});
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete user';
      Alert.alert('Error', errorMessage);
    }
  };

  const hideSuccessModal = () => {
    setSuccessModal({visible: false, message: ''});
  };

  const showUserModal = (user: User) => {
    setUserModal({visible: true, user});
  };

  const hideUserModal = () => {
    setUserModal({visible: false, user: null});
  };

  const resetUserPassword = async () => {
    if (!userModal.user) return;
    try {
      await apiService.post(`/admin/users/${userModal.user._id}/reset-password`);
      setSuccessModal({visible: true, message: 'Password reset email sent'});
    } catch (error: any) {
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  const logoutUserDevices = async () => {
    if (!userModal.user) return;
    try {
      await apiService.post(`/admin/users/${userModal.user._id}/logout-devices`);
      setSuccessModal({visible: true, message: 'User logged out from all devices'});
    } catch (error: any) {
      Alert.alert('Error', 'Failed to logout user devices');
    }
  };

  const styles = StyleSheet.create({

    searchInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 16,
    },
    userCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    userInfo: {
      flex: 1,
      marginRight: 12,
    },
    userName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    userStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    userActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    adminBadge: {
      backgroundColor: '#F59E0B',
    },
    roleBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
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
      marginBottom: 20,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    deleteButtonModal: {
      backgroundColor: theme.error,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.text,
    },
    deleteButtonTextModal: {
      color: '#FFFFFF',
    },
    successModal: {
      backgroundColor: '#10B981',
    },
    successButtonText: {
      color: '#FFFFFF',
    },
    userModalContent: {
      maxHeight: '80%',
    },
    userModalSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    userDetail: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
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
    adminAction: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    adminActionText: {
      fontSize: 14,
      color: theme.text,
      marginLeft: 12,
      flex: 1,
    },
    dangerAction: {
      backgroundColor: '#FEF2F2',
    },
    dangerActionText: {
      color: '#DC2626',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage user accounts</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>{users.length} total users</Text>
        

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadUsers}
        />

        {users.map((user) => (
          <View key={user._id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.username}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={[styles.roleBadge, user.role === 'admin' && styles.adminBadge]}>
                <Text style={styles.roleBadgeText}>{user.role}</Text>
              </View>
            </View>
            
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.apiUsage?.totalAnalyses || 0}</Text>
                <Text style={styles.statLabel}>Analyses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.isActive ? 'Active' : 'Inactive'}</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.statLabel}>Joined</Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('UserDetails', { userId: user._id })}
              >
                <UserIcon size={16} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleUserRole(user._id, user.role)}
              >
                <ToggleIcon size={16} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => showDeleteModal(user)}
              >
                <TrashIcon size={16} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={deleteModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete User</Text>
            <Text style={styles.modalMessage}>
              Delete user "{deleteModal.user?.username}"?{"\n"}This cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={hideDeleteModal}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButtonModal]}
                onPress={confirmDelete}
              >
                <Text style={[styles.modalButtonText, styles.deleteButtonTextModal]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>{successModal.message}</Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.successModal]}
              onPress={hideSuccessModal}
            >
              <Text style={[styles.modalButtonText, styles.successButtonText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={userModal.visible}
        transparent
        animationType="slide"
        onRequestClose={hideUserModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.userModalContent]}>
            <Text style={styles.modalTitle}>User Details</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.userModalSection}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.userDetail}>
                  <Text style={styles.detailLabel}>Username:</Text>
                  <Text style={styles.detailValue}>{userModal.user?.username}</Text>
                </View>
                <View style={styles.userDetail}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{userModal.user?.email}</Text>
                </View>
                <View style={styles.userDetail}>
                  <Text style={styles.detailLabel}>Role:</Text>
                  <Text style={styles.detailValue}>{userModal.user?.role}</Text>
                </View>
                <View style={styles.userDetail}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{userModal.user?.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
                <View style={styles.userDetail}>
                  <Text style={styles.detailLabel}>Joined:</Text>
                  <Text style={styles.detailValue}>{userModal.user ? new Date(userModal.user.createdAt).toLocaleDateString() : ''}</Text>
                </View>
              </View>

              <View style={styles.userModalSection}>
                <Text style={styles.sectionTitle}>Usage Statistics</Text>
                <View style={styles.userDetail}>
                  <Text style={styles.detailLabel}>Total Analyses:</Text>
                  <Text style={styles.detailValue}>{userModal.user?.apiUsage?.totalAnalyses || 0}</Text>
                </View>
              </View>

              <View style={styles.userModalSection}>
                <Text style={styles.sectionTitle}>Admin Actions</Text>
                
                <TouchableOpacity style={styles.adminAction} onPress={() => toggleUserRole(userModal.user?._id || '', userModal.user?.role || '')}>
                  <Text>🔄</Text>
                  <Text style={styles.adminActionText}>
                    {userModal.user?.role === 'admin' ? 'Remove Admin Role' : 'Grant Admin Role'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.adminAction} onPress={resetUserPassword}>
                  <Text>🔑</Text>
                  <Text style={styles.adminActionText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.adminAction} onPress={logoutUserDevices}>
                  <Text>📱</Text>
                  <Text style={styles.adminActionText}>Logout All Devices</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.adminAction, styles.dangerAction]} onPress={() => { hideUserModal(); showDeleteModal(userModal.user!); }}>
                  <Text>🗑️</Text>
                  <Text style={[styles.adminActionText, styles.dangerActionText]}>Delete User Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={hideUserModal}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminUsersScreen;