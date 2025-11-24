import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import SuccessModal from '../../components/SuccessModal';
import DeprecationBanner from '../../components/DeprecationBanner';

const AdminDeprecationBannerScreen: React.FC = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showOnV1, setShowOnV1] = useState(false);
  const [showOnV2, setShowOnV2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await apiService.get('/deprecation-banner/admin/config');
      const { banner } = response.data;
      setMessage(banner.message);
      setIsActive(banner.isActive);
      setShowOnV1(banner.pages.includes('analysis-v1'));
      setShowOnV2(banner.pages.includes('analysis-v2'));
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      const pages = [];
      if (showOnV1) pages.push('analysis-v1');
      if (showOnV2) pages.push('analysis-v2');

      await apiService.post('/deprecation-banner/admin/update', {
        message,
        isActive,
        pages
      });

      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
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
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 14,
      color: theme.text,
      fontSize: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    switchLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
    },
    saveButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 12,
    },
    saveButtonGradient: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    previewSection: {
      marginTop: 24,
    },
    previewLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deprecation Banner</Text>
        <Text style={styles.subtitle}>Manage deprecation warnings for analysis pages</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banner Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter deprecation message..."
            placeholderTextColor={theme.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Banner</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: theme.border, true: '#00D4FF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show on Analysis V1</Text>
            <Switch
              value={showOnV1}
              onValueChange={setShowOnV1}
              trackColor={{ false: theme.border, true: '#00D4FF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show on Analysis V2</Text>
            <Switch
              value={showOnV2}
              onValueChange={setShowOnV2}
              trackColor={{ false: theme.border, true: '#00D4FF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveConfig} disabled={loading}>
            <LinearGradient colors={['#00D4FF', '#764ba2']} style={styles.saveButtonGradient}>
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Configuration'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {isActive && message && (
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Live Preview</Text>
            <DeprecationBanner message={message} />
          </View>
        )}
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        message="Configuration saved successfully"
        onClose={() => setShowSuccess(false)}
      />
    </View>
  );
};

export default AdminDeprecationBannerScreen;
