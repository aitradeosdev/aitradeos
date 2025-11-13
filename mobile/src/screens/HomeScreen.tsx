import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/apiService';
import RocketIcon from '../components/icons/RocketIcon';
import ChartIcon from '../components/icons/ChartIcon';
import NotificationBell from '../components/NotificationBell';
import UpgradeDynamicIsland from '../components/UpgradeDynamicIsland';

const { width } = Dimensions.get('window');

interface UserStats {
  totalAnalyses: number;
  signalDistribution: { BUY: number; SELL: number; HOLD: number };
  averageConfidence: number;
  monthlyAnalyses: number;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    action: string;
    confidence: number;
    symbol?: string;
  }>;
}

const HomeScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadDashboardData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      })
    ]).start();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse] = await Promise.all([
        apiService.getUserStatistics(),
        refreshUser()
      ]);
      
      setStats(statsResponse.data.statistics);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateToAnalysis = () => {
    navigation.navigate('Analysis' as never);
  };

  const navigateToHistory = () => {
    navigation.navigate('History' as never);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    animatedContainer: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 32,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    headerContent: {
      flex: 1,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    upgradeButtonContainer: {
      position: 'absolute',
      top: 15,
      left: 0,
      right: 0,
      zIndex: 1000,
      alignItems: 'center',
    },
    avatarContainer: {
      marginRight: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    headerTextContainer: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 4,
      fontWeight: '500',
    },
    userName: {
      fontSize: 28,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },
    headerStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    quickStat: {
      alignItems: 'center',
    },
    quickStatValue: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    quickStatLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 100,
    },
    quickActions: {
      marginBottom: 40,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
      letterSpacing: -0.3,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    primaryActionButton: {
      flex: 2,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    actionButtonGradient: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 140,
    },
    actionButtonIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    primaryActionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
      textAlign: 'center',
    },
    primaryActionSubtitle: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
    },
    secondaryActionButton: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    secondaryActionContent: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 140,
    },
    secondaryActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    secondaryActionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    secondaryActionSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    statsContainer: {
      marginBottom: 40,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    statCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      flex: 1,
      minWidth: (width - 64) / 2,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      position: 'relative',
      overflow: 'hidden',
    },
    statCardGradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 60,
      height: 60,
      opacity: 0.1,
    },
    statValue: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.primary,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    signalDistribution: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    distributionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    signalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    signalDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    signalLabel: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    signalCount: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    recentActivity: {
      marginBottom: 40,
    },
    activityCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    activityLeft: {
      flex: 1,
    },
    activitySymbol: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    activityDate: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    activityRight: {
      alignItems: 'flex-end',
    },
    activityAction: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    activityConfidence: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    getStartedButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    getStartedText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return theme.buy;
      case 'SELL': return theme.sell;
      case 'HOLD': return theme.hold;
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.animatedContainer}>
        {/* Upgrade Button positioned at top */}
        {user?.subscription?.plan === 'free' && (
          <View style={styles.upgradeButtonContainer}>
            <UpgradeDynamicIsland />
          </View>
        )}
        
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#00D4FF', '#0099CC']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user?.profile?.firstName?.charAt(0) || user?.username?.charAt(0) || 'H'}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>
                  {getGreeting()}{user?.profile?.firstName ? `, ${user.profile.firstName}` : ''}
                </Text>
                <Text style={styles.userName}>
                  Ready to analyze?
                </Text>
              </View>
              <NotificationBell />
            </View>
            <View style={styles.headerStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{user?.apiUsage?.totalAnalyses || 0}</Text>
                <Text style={styles.quickStatLabel}>Total Analyses</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{user?.apiUsage?.monthlyAnalyses || 0}</Text>
                <Text style={styles.quickStatLabel}>This Month</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              onPress={navigateToAnalysis}
              activeOpacity={0.8}
              style={styles.primaryActionButton}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionButtonIcon}>
                  <RocketIcon size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.primaryActionTitle}>Analyze Chart</Text>
                <Text style={styles.primaryActionSubtitle}>AI-powered analysis</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={navigateToHistory}
              activeOpacity={0.8}
              style={styles.secondaryActionButton}
            >
              <View style={styles.secondaryActionContent}>
                <View style={styles.secondaryActionIcon}>
                  <ChartIcon size={20} color={theme.primary} />
                </View>
                <Text style={styles.secondaryActionTitle}>History</Text>
                <Text style={styles.secondaryActionSubtitle}>View past analyses</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {stats ? (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Analytics Overview</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['#00D4FF', '#0099CC']}
                    style={styles.statCardGradient}
                  />
                  <Text style={styles.statValue}>{user?.apiUsage?.totalAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>Total Analyses</Text>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['#4CAF50', '#388E3C']}
                    style={styles.statCardGradient}
                  />
                  <Text style={styles.statValue}>{user?.apiUsage?.monthlyAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>This Month</Text>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['#FF9800', '#F57C00']}
                    style={styles.statCardGradient}
                  />
                  <Text style={styles.statValue}>{stats?.averageConfidence || 0}%</Text>
                  <Text style={styles.statLabel}>Avg Confidence</Text>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['#9C27B0', '#7B1FA2']}
                    style={styles.statCardGradient}
                  />
                  <Text style={styles.statValue}>{stats?.averageRating || 0}</Text>
                  <Text style={styles.statLabel}>User Rating</Text>
                </View>
              </View>

              <View style={styles.signalDistribution}>
                <Text style={styles.distributionTitle}>Signal Distribution</Text>
                
                <View style={styles.signalRow}>
                  <View style={[styles.signalDot, { backgroundColor: theme.buy }]} />
                  <Text style={styles.signalLabel}>BUY Signals</Text>
                  <Text style={styles.signalCount}>{stats?.signalDistribution?.BUY || 0}</Text>
                </View>
                
                <View style={styles.signalRow}>
                  <View style={[styles.signalDot, { backgroundColor: theme.sell }]} />
                  <Text style={styles.signalLabel}>SELL Signals</Text>
                  <Text style={styles.signalCount}>{stats?.signalDistribution?.SELL || 0}</Text>
                </View>
                
                <View style={styles.signalRow}>
                  <View style={[styles.signalDot, { backgroundColor: theme.hold }]} />
                  <Text style={styles.signalLabel}>HOLD Signals</Text>
                  <Text style={styles.signalCount}>{stats?.signalDistribution?.HOLD || 0}</Text>
                </View>
              </View>
            </View>

            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <View style={styles.recentActivity}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                
                {stats.recentActivity.slice(0, 5).map((activity) => (
                  <View key={activity.id} style={styles.activityCard}>
                    <View style={styles.activityLeft}>
                      <Text style={styles.activitySymbol}>
                        {activity.symbol || 'Chart Analysis'}
                      </Text>
                      <Text style={styles.activityDate}>
                        {formatDate(activity.timestamp)}
                      </Text>
                    </View>
                    
                    <View style={styles.activityRight}>
                      <Text style={[
                        styles.activityAction,
                        { color: getActionColor(activity.action) }
                      ]}>
                        {activity.action}
                      </Text>
                      <Text style={styles.activityConfidence}>
                        {activity.confidence}% confidence
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Start analyzing trading charts to see your dashboard insights
            </Text>
            <TouchableOpacity style={styles.getStartedButton} onPress={navigateToAnalysis}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;