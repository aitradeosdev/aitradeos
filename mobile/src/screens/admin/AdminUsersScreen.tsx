import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';

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

const AdminUsersScreen: React.FC = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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

  const deleteUser = async (userId: string, username: string) => {
    Alert.alert(
      'Delete User',
      `Delete user "${username}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`/admin/users/${userId}`);
              loadUsers();
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
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    userEmail: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    userStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    userStat: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    userActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
    },
    roleButton: {
      backgroundColor: theme.primary,
    },
    deleteButton: {
      backgroundColor: theme.error,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    roleBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
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
        <Text style={styles.subtitle}>Manage user accounts</Text>
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
              <Text style={styles.userName}>{user.username}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.userEmail}>{user.email}</Text>
            
            <View style={styles.userStats}>
              <Text style={styles.userStat}>
                Analyses: {user.apiUsage?.totalAnalyses || 0}
              </Text>
              <Text style={styles.userStat}>
                Status: {user.isActive ? 'Active' : 'Inactive'}
              </Text>
              <Text style={styles.userStat}>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.roleButton]}
                onPress={() => toggleUserRole(user._id, user.role)}
              >
                <Text style={styles.actionButtonText}>
                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteUser(user._id, user.username)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default AdminUsersScreen;