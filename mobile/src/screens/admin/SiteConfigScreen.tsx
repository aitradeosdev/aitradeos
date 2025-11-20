import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';

interface SiteConfigScreenProps {
  navigation: any;
}

const SiteConfigScreen: React.FC<SiteConfigScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState({
    useRealActiveUsers: true,
    customActiveUsers: 10000,
    activeUsersCount: 0
  });
  const [realActiveUsers, setRealActiveUsers] = useState(0);
  const [customInput, setCustomInput] = useState('10000');

  useEffect(() => {
    loadConfig();
  }, []);



  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/admin/site-config');
      setConfig(response.data.config);
      setRealActiveUsers(response.data.realActiveUsers);
      setCustomInput(response.data.config.customActiveUsers.toString());
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load site configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      const customActiveUsers = parseInt(customInput) || 0;
      await apiService.put('/admin/site-config', {
        useRealActiveUsers: config.useRealActiveUsers,
        customActiveUsers
      });
      Alert.alert('Success', 'Site configuration updated successfully');
      loadConfig();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update configuration');
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
    },
    backButton: {
      marginBottom: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.primary,
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
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    statValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.text,
      flex: 1,
    },
    input: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginTop: 8,
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
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
          <Text style={styles.title}>Site Configuration</Text>
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
        <Text style={styles.title}>Site Configuration</Text>
        <Text style={styles.subtitle}>Manage public site settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Users Display</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Real Active Users (24h)</Text>
            <Text style={styles.statValue}>{realActiveUsers.toLocaleString()}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Currently Displayed</Text>
            <Text style={styles.statValue}>{config.activeUsersCount.toLocaleString()}+</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Settings</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Use Real Active Users Count</Text>
            <Switch
              value={config.useRealActiveUsers}
              onValueChange={(value) => setConfig({...config, useRealActiveUsers: value})}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {!config.useRealActiveUsers && (
            <View>
              <Text style={styles.switchLabel}>Custom Active Users Count</Text>
              <TextInput
                style={styles.input}
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="Enter custom count"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={updateConfig}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SiteConfigScreen;