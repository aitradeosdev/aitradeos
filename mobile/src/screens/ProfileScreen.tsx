import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { apiService } from '../services/apiService';
import VerifiedIcon from '../components/icons/VerifiedIcon';

interface UserStatistics {
  totalAnalyses: number;
  signalDistribution: { BUY: number; SELL: number; HOLD: number };
  averageConfidence: number;
  averageRating: number;
  totalFeedbacks: number;
}

type RootStackParamList = {
  Settings: undefined;
  MainTabs: undefined;
  Result: undefined;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { user, logout, refreshUser } = useAuth();
  const { isAdminMode, setAdminMode } = useAdmin();
  
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await apiService.getUserStatistics();
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Failed to load user statistics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), loadUserStats()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const getInitials = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'HU';
  };

  const getDisplayName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user?.username || user?.email || 'Huntr User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return theme.buy;
      case 'SELL': return theme.sell;
      case 'HOLD': return theme.hold;
      default: return theme.textSecondary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerGradient: {
      paddingBottom: 20,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card + '80',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    userInfo: {
      flex: 1,
    },
    displayName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    username: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 6,
    },
    subscriptionBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    subscriptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    subscriptionText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
      letterSpacing: -0.3,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    statItem: {
      flex: 1,
      minWidth: '40%',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    },
    statItemGradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 40,
      height: 40,
      opacity: 0.1,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    distributionContainer: {
      marginTop: 16,
    },
    distributionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    distributionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    distributionDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    distributionLabel: {
      fontSize: 14,
      color: theme.text,
    },
    distributionValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
    actionButton: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionButtonText: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    dangerButton: {
      borderColor: theme.error,
    },
    dangerButtonText: {
      color: theme.error,
    },
    settingsButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    settingsButtonText: {
      color: theme.text,
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
              <Text style={styles.settingsButtonText}>⚙</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerContent}>
            <LinearGradient
              colors={['#00D4FF', '#0099CC']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </LinearGradient>
            
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{getDisplayName()}</Text>
              <Text style={styles.username}>@{user?.username}</Text>
              <View style={styles.subscriptionBadge}>
                <View style={styles.subscriptionContent}>
                  <Text style={styles.subscriptionText}>
                    {user?.subscription?.plan || 'Free'} Plan
                  </Text>
                  {user?.subscription?.plan === 'premium' && (
                    <VerifiedIcon size={12} color="#FFFFFF" />
                  )}
                </View>
              </View>
            </View>
          </View>
          
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.averageConfidence}%</Text>
                <Text style={styles.statLabel}>Avg Confidence</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.averageRating || 0}</Text>
                <Text style={styles.statLabel}>User Rating</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user?.apiUsage?.totalAnalyses || 0}</Text>
                <Text style={styles.statLabel}>Total Analyses</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Login</Text>
            <Text style={styles.infoValue}>
              {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
            </Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Monthly Usage</Text>
            <Text style={styles.infoValue}>
              {user?.apiUsage?.monthlyAnalyses || 0} analyses
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data Training</Text>
            <Text style={[
              styles.infoValue,
              { color: user?.settings?.allowDataTraining ? theme.buy : theme.error }
            ]}>
              {user?.settings?.allowDataTraining ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notifications</Text>
            <Text style={[
              styles.infoValue,
              { color: user?.settings?.notifications ? theme.buy : theme.error }
            ]}>
              {user?.settings?.notifications ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Theme</Text>
            <Text style={styles.infoValue}>
              {user?.settings?.theme === 'light' ? 'Light' : 'Dark'}
            </Text>
          </View>
        </View>

        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                isAdminMode && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => setAdminMode(!isAdminMode)}
            >
              <Text style={[
                styles.actionButtonText,
                isAdminMode && { color: '#FFFFFF' }
              ]}>
                {isAdminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
              </Text>
            </TouchableOpacity>
          </View>
        )}



      </ScrollView>
    </View>
  );
};

export default ProfileScreen;