import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAdmin } from '../contexts/AdminContext';
import { useBlog } from '../contexts/BlogContext';

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { setAdminMode } = useAdmin();
  const { setBlogMode } = useBlog();

  useEffect(() => {
    // Redirect to new admin interface
    setAdminMode(true);
    navigation.goBack();
  }, []);

  const handleBlogManager = async () => {
    await setBlogMode(true);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

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
    blogButton: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 20,
    },
    blogButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.text}>Redirecting to Admin Panel...</Text>
      <TouchableOpacity style={styles.blogButton} onPress={handleBlogManager}>
        <Text style={styles.blogButtonText}>Blog Manager</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminDashboardScreen;