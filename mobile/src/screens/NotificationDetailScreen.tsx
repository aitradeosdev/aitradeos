import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NotificationDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { markAsRead } = useNotifications();
  const navigation = useNavigation();
  const route = useRoute();
  const { notification } = route.params as { notification: any };

  useEffect(() => {
    if (notification && !notification.read) {
      markAsRead(notification.id);
    }
  }, [notification]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return theme.buy;
      case 'error': return theme.error;
      case 'warning': return '#FF9800';
      default: return theme.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      paddingRight: 16,
    },
    backText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    typeIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    timestamp: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    message: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View 
          style={[
            styles.typeIndicator,
            { backgroundColor: getTypeColor(notification.type) }
          ]}
        />
        
        <Text style={styles.title}>
          {notification.title}
        </Text>
        
        <Text style={styles.timestamp}>
          {formatTime(notification.timestamp)}
        </Text>
        
        <Text style={styles.message}>
          {notification.message}
        </Text>
      </ScrollView>
    </View>
  );
};

export default NotificationDetailScreen;