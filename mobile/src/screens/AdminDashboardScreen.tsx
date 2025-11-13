import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAdmin } from '../contexts/AdminContext';

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { setAdminMode } = useAdmin();

  useEffect(() => {
    // Redirect to new admin interface
    setAdminMode(true);
    navigation.goBack();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: theme.text,
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.text}>Redirecting to Admin Panel...</Text>
    </View>
  );
};

export default AdminDashboardScreen;