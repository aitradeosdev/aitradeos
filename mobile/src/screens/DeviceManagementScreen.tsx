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
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

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

const DeviceManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState<Device | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDevices();
      setDevices(response.data.devices || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = (device: Device) => {
    if (device.isCurrent) {
      Alert.alert('Cannot Remove', 'You cannot remove the current device');
      return;
    }
    setDeviceToRemove(device);
    setShowRemoveModal(true);
  };

  const confirmRemoveDevice = async () => {
    if (!deviceToRemove) return;

    try {
      setIsRemoving(true);
      await apiService.removeDevice(deviceToRemove.id);
      setDevices(prev => prev.filter(d => d.id !== deviceToRemove.id));
      setShowRemoveModal(false);
      setDeviceToRemove(null);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to remove device');
    } finally {
      setIsRemoving(false);
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
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deviceCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    currentDeviceCard: {
      borderColor: theme.primary,
      borderWidth: 2,
    },
    deviceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    deviceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
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
    currentBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    currentBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    deviceDetails: {
      marginTop: 8,
    },
    deviceDetail: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    removeButton: {
      backgroundColor: theme.error,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginTop: 8,
    },
    removeButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
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
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Device Management</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading devices...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Device Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices found</Text>
          </View>
        ) : (
          devices.map((device) => (
            <View
              key={device.id}
              style={[
                styles.deviceCard,
                device.isCurrent && styles.currentDeviceCard
              ]}
            >
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceIcon}>{getDeviceIcon(device.type)}</Text>
                  <Text style={styles.deviceName}>{device.name}</Text>
                </View>
                {device.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>

              <View style={styles.deviceDetails}>
                <Text style={styles.deviceDetail}>
                  Last active: {formatLastActive(device.lastActive)}
                </Text>
                {device.platform && (
                  <Text style={styles.deviceDetail}>Platform: {device.platform}</Text>
                )}
                {device.browser && (
                  <Text style={styles.deviceDetail}>Browser: {device.browser}</Text>
                )}
                {device.location && (
                  <Text style={styles.deviceDetail}>Location: {device.location}</Text>
                )}
              </View>

              {!device.isCurrent && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveDevice(device)}
                >
                  <Text style={styles.removeButtonText}>Remove Device</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove Device</Text>
            <Text style={styles.modalText}>
              Are you sure you want to remove "{deviceToRemove?.name}"? This will sign out this device from your account.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowRemoveModal(false);
                  setDeviceToRemove(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRemoveDevice}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Remove</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DeviceManagementScreen;