import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import TrashIcon from '../../components/icons/TrashIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import LogoutIcon from '../../components/icons/LogoutIcon';

interface UserDevicesScreenProps {
  route: {
    params: {
      userId: string;
      username: string;
    };
  };
  navigation: any;
}

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  platform?: string;
  browser?: string;
  lastActive: string;
  location?: string;
  isCurrent: boolean;
  createdAt: string;
}

const UserDevicesScreen: React.FC<UserDevicesScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { userId, username } = route.params;
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{visible: boolean; type: 'single' | 'all'; device?: Device}>({visible: false, type: 'single'});
  const [successModal, setSuccessModal] = useState<{visible: boolean; message: string}>({visible: false, message: ''});

  useEffect(() => {
    loadUserDevices();
  }, [userId]);

  const loadUserDevices = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/admin/users/${userId}`);
      setDevices(response.data.user.devices || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load user devices');
    } finally {
      setIsLoading(false);
    }
  };

  const showLogoutAllConfirm = () => {
    setConfirmModal({visible: true, type: 'all'});
  };

  const logoutAllDevices = async () => {
    try {
      await apiService.post(`/admin/users/${userId}/logout-devices`);
      setConfirmModal({visible: false, type: 'single'});
      setSuccessModal({visible: true, message: 'All devices removed successfully'});
      loadUserDevices();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to logout devices');
    }
  };

  const showRemoveDeviceConfirm = (device: Device) => {
    setConfirmModal({visible: true, type: 'single', device});
  };

  const logoutSingleDevice = async () => {
    if (!confirmModal.device) return;
    
    try {
      await apiService.delete(`/admin/users/${userId}/devices/${confirmModal.device.id}`);
      setConfirmModal({visible: false, type: 'single'});
      setSuccessModal({visible: true, message: 'Device removed successfully'});
      loadUserDevices();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to remove device');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return '📱';
      case 'desktop': return '💻';
      case 'tablet': return '📱';
      default: return '📱';
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
    logoutAllButton: {
      backgroundColor: theme.error,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    logoutAllText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    deviceCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    deviceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    deviceIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    deviceName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    currentDeviceCard: {
      borderColor: '#10B981',
      borderWidth: 2,
    },
    currentDeviceBadge: {
      backgroundColor: '#10B981',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    currentDeviceText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    deviceInfo: {
      marginBottom: 12,
    },
    deviceDetail: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    detailValue: {
      fontSize: 12,
      color: theme.text,
    },
    logoutButton: {
      backgroundColor: theme.error,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
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
      alignItems: 'center',
    },
    modalIcon: {
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
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
      backgroundColor: theme.error,
    },
    successButton: {
      backgroundColor: '#10B981',
      width: '100%',
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
    successButtonText: {
      color: '#FFFFFF',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>User Devices</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>User Devices</Text>
        <Text style={styles.subtitle}>{username} • {devices.length} devices</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {devices.length > 0 && (
          <TouchableOpacity style={styles.logoutAllButton} onPress={showLogoutAllConfirm}>
            <LogoutIcon size={20} color="#FFFFFF" />
            <Text style={styles.logoutAllText}>Logout All Devices</Text>
          </TouchableOpacity>
        )}

        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active devices found</Text>
          </View>
        ) : (
          devices.map((device) => (
            <View key={device.id} style={[styles.deviceCard, device.isCurrent && styles.currentDeviceCard]}>
              <View style={styles.deviceHeader}>
                <Text style={styles.deviceIcon}>{getDeviceIcon(device.type)}</Text>
                <Text style={styles.deviceName}>{device.name}</Text>
                {device.isCurrent && (
                  <View style={styles.currentDeviceBadge}>
                    <Text style={styles.currentDeviceText}>CURRENT</Text>
                  </View>
                )}
              </View>

              <View style={styles.deviceInfo}>
                <View style={styles.deviceDetail}>
                  <Text style={styles.detailLabel}>Last Active:</Text>
                  <Text style={styles.detailValue}>{formatLastActive(device.lastActive)}</Text>
                </View>
                {device.platform && (
                  <View style={styles.deviceDetail}>
                    <Text style={styles.detailLabel}>Platform:</Text>
                    <Text style={styles.detailValue}>{device.platform}</Text>
                  </View>
                )}
                {device.browser && (
                  <View style={styles.deviceDetail}>
                    <Text style={styles.detailLabel}>Browser:</Text>
                    <Text style={styles.detailValue}>{device.browser}</Text>
                  </View>
                )}
                {device.location && (
                  <View style={styles.deviceDetail}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{device.location}</Text>
                  </View>
                )}
              </View>

              {!device.isCurrent && (
                <TouchableOpacity 
                  style={styles.logoutButton} 
                  onPress={() => showRemoveDeviceConfirm(device)}
                >
                  <TrashIcon size={16} color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Remove Device</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal({visible: false, type: 'single'})}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              {confirmModal.type === 'all' ? (
                <LogoutIcon size={48} color={theme.error} />
              ) : (
                <TrashIcon size={48} color={theme.error} />
              )}
            </View>
            
            <Text style={styles.modalTitle}>
              {confirmModal.type === 'all' ? 'Logout All Devices' : 'Remove Device'}
            </Text>
            
            <Text style={styles.modalMessage}>
              {confirmModal.type === 'all' 
                ? `Logout ${username} from all devices? This will force them to login again on all devices.`
                : `Remove device "${confirmModal.device?.name}"? This will sign out this device from the account.`
              }
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModal({visible: false, type: 'single'})}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmModal.type === 'all' ? logoutAllDevices : logoutSingleDevice}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  {confirmModal.type === 'all' ? 'Logout All' : 'Remove'}
                </Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <CheckCircleIcon size={64} color="#10B981" />
            </View>
            
            <Text style={[styles.modalTitle, {color: '#10B981'}]}>Success</Text>
            <Text style={styles.modalMessage}>{successModal.message}</Text>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.successButton]}
              onPress={() => setSuccessModal({visible: false, message: ''})}
            >
              <Text style={[styles.buttonText, styles.successButtonText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserDevicesScreen;