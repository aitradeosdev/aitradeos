import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import EmailIcon from '../../components/icons/EmailIcon';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import PhoneIcon from '../../components/icons/PhoneIcon';

interface ContactConfig {
  email: {
    enabled: boolean;
    address: string;
    label: string;
  };
  whatsapp: {
    enabled: boolean;
    number: string;
    label: string;
  };
  phone: {
    enabled: boolean;
    number: string;
    label: string;
  };
}

const AdminContactConfigScreen: React.FC = () => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<ContactConfig>({
    email: { enabled: false, address: '', label: 'Email Support' },
    whatsapp: { enabled: false, number: '', label: 'WhatsApp Support' },
    phone: { enabled: false, number: '', label: 'Phone Support' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await apiService.getContactConfig();
      setConfig(response.data.config);
    } catch (error) {
      console.error('Failed to load contact config:', error);
      Alert.alert('Error', 'Failed to load contact configuration');
    }
  };

  const updateConfig = async () => {
    try {
      setLoading(true);
      await apiService.updateContactConfig(config);
      Alert.alert('Success', 'Contact configuration updated successfully');
    } catch (error) {
      console.error('Failed to update contact config:', error);
      Alert.alert('Error', 'Failed to update contact configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (type: 'email' | 'whatsapp' | 'phone', field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
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
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    enabledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    enabledLabel: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '600',
    },
    inputGroup: {
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 6,
    },
    textInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.text,
    },
    disabledSection: {
      opacity: 0.5,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    helpText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contact Configuration</Text>
        <Text style={styles.subtitle}>Manage customer support contact options</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Email Configuration */}
        <View style={[styles.section, !config.email.enabled && styles.disabledSection]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <EmailIcon size={20} color={theme.primary} />
            </View>
            <Text style={styles.sectionTitle}>Email Support</Text>
          </View>
          
          <View style={styles.enabledRow}>
            <Text style={styles.enabledLabel}>Enable Email Support</Text>
            <Switch
              value={config.email.enabled}
              onValueChange={(value) => updateField('email', 'enabled', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {config.email.enabled && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.email.address}
                  onChangeText={(value) => updateField('email', 'address', value)}
                  placeholder="support@huntr.ai"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.helpText}>
                  Email address where users can send support requests
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Label</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.email.label}
                  onChangeText={(value) => updateField('email', 'label', value)}
                  placeholder="Email Support"
                />
              </View>
            </>
          )}
        </View>

        {/* WhatsApp Configuration */}
        <View style={[styles.section, !config.whatsapp.enabled && styles.disabledSection]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <WhatsAppIcon size={20} />
            </View>
            <Text style={styles.sectionTitle}>WhatsApp Support</Text>
          </View>
          
          <View style={styles.enabledRow}>
            <Text style={styles.enabledLabel}>Enable WhatsApp Support</Text>
            <Switch
              value={config.whatsapp.enabled}
              onValueChange={(value) => updateField('whatsapp', 'enabled', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {config.whatsapp.enabled && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WhatsApp Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.whatsapp.number}
                  onChangeText={(value) => updateField('whatsapp', 'number', value)}
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                />
                <Text style={styles.helpText}>
                  Include country code (e.g., +1234567890)
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Label</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.whatsapp.label}
                  onChangeText={(value) => updateField('whatsapp', 'label', value)}
                  placeholder="WhatsApp Support"
                />
              </View>
            </>
          )}
        </View>

        {/* Phone Configuration */}
        <View style={[styles.section, !config.phone.enabled && styles.disabledSection]}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <PhoneIcon size={20} color={theme.primary} />
            </View>
            <Text style={styles.sectionTitle}>Phone Support</Text>
          </View>
          
          <View style={styles.enabledRow}>
            <Text style={styles.enabledLabel}>Enable Phone Support</Text>
            <Switch
              value={config.phone.enabled}
              onValueChange={(value) => updateField('phone', 'enabled', value)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {config.phone.enabled && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.phone.number}
                  onChangeText={(value) => updateField('phone', 'number', value)}
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                />
                <Text style={styles.helpText}>
                  Include country code (e.g., +1234567890)
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Label</Text>
                <TextInput
                  style={styles.textInput}
                  value={config.phone.label}
                  onChangeText={(value) => updateField('phone', 'label', value)}
                  placeholder="Phone Support"
                />
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={updateConfig}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminContactConfigScreen;