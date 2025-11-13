import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

interface AnalysisItem {
  id: string;
  timestamp: string;
  signal: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    entryPoint: number;
    takeProfit: number[];
    stopLoss: number;
  };
  marketContext: {
    symbol: string;
    timeframe: string;
    marketType: string;
  };
  feedback?: {
    rating?: number;
    comments?: string;
  };
}

interface FilterState {
  signal: 'ALL' | 'BUY' | 'SELL' | 'HOLD';
  sortBy: 'timestamp' | 'confidence';
  sortOrder: 'desc' | 'asc';
}

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    signal: 'ALL',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAnalysisId, setDeleteAnalysisId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearError, setClearError] = useState('');

  useEffect(() => {
    testApiConnection();
    loadAnalysisHistory();
  }, []);

  const testApiConnection = async () => {
    try {
      await apiService.checkHealth();
    } catch (error: any) {
      // Health check failed
    }
  };

  useEffect(() => {
    applyFilters();
  }, [analyses, filters]);

  const loadAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAnalysisHistory();
      setAnalyses(response.data.analyses || []);
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load analysis history');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisHistory();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    if (filters.signal !== 'ALL') {
      filtered = filtered.filter(analysis => analysis.signal.action === filters.signal);
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (filters.sortBy === 'timestamp') {
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
      } else {
        aValue = a.signal.confidence;
        bValue = b.signal.confidence;
      }

      const comparison = aValue > bValue ? 1 : -1;
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredAnalyses(filtered);
  };

  const deleteAnalysis = async (analysisId: string) => {
    setDeleteAnalysisId(analysisId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteAnalysisId) return;
    
    try {
      await apiService.deleteAnalysis(deleteAnalysisId);
      setAnalyses(prev => prev.filter(a => a.id !== deleteAnalysisId));
    } catch (error: any) {
      console.error('Delete analysis error:', error.response?.data || error.message);
    }
    
    setShowDeleteModal(false);
    setDeleteAnalysisId(null);
  };

  const clearAllHistory = async () => {
    setShowClearModal(true);
  };

  const confirmClearAll = async () => {
    if (!clearPassword.trim()) return;
    
    try {
      await apiService.clearUserHistory(clearPassword);
      setAnalyses([]);
      setShowClearModal(false);
      setClearPassword('');
      setClearError('');
    } catch (error: any) {
      setClearError(error.response?.data?.error || 'Failed to clear history');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return theme.buy;
      case 'SELL': return theme.sell;
      case 'HOLD': return theme.hold;
      default: return theme.textSecondary;
    }
  };

  const formatPrice = (price: number) => {
    if (price === null || price === undefined || price === 0) return 'N/A';
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  const renderAnalysisItem = ({ item }: { item: AnalysisItem }) => (
    <TouchableOpacity 
      style={styles.analysisCard}
      onPress={() => navigation.navigate('Result' as never, { 
        analysis: {
          id: item.id,
          signal: {
            action: item.signal.action,
            confidence: item.signal.confidence,
            entryPoint: item.signal.entryPoint || 0,
            takeProfit: item.signal.takeProfit || [0],
            stopLoss: item.signal.stopLoss || 0,
            riskReward: item.signal.riskReward || 1,
            timeframe: item.marketContext?.timeframe || '1h'
          },
          reasoning: {
            primary: 'Historical analysis from your trading history',
            secondary: [],
            risks: [],
            catalysts: []
          },
          chartAnalysis: {
            detectedPatterns: [],
            technicalIndicators: [],
            supportLevels: [],
            resistanceLevels: [],
            volume: 'N/A',
            trend: 'N/A'
          },
          marketContext: item.marketContext,
          webSearchResults: [],
          timestamp: item.timestamp,
          processingTime: 0
        },
        metadata: { fromHistory: true }
      } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.signalContainer}>
          <View style={[styles.signalBadge, { backgroundColor: getSignalColor(item.signal.action) }]}>
            <Text style={styles.signalText}>{item.signal.action}</Text>
          </View>
          <Text style={styles.confidence}>{item.signal.confidence}%</Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteAnalysis(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>
            {item.marketContext?.symbol || 'Chart Analysis'}
          </Text>
          <Text style={styles.marketType}>
            {item.marketContext?.marketType || 'Unknown'}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Entry</Text>
            <Text style={styles.priceValue}>{formatPrice(item.signal.entryPoint)}</Text>
          </View>
          
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Take Profit</Text>
            <Text style={[styles.priceValue, { color: theme.buy }]}>
              {item.signal.takeProfit && item.signal.takeProfit.length > 0 ? formatPrice(item.signal.takeProfit[0]) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Stop Loss</Text>
            <Text style={[styles.priceValue, { color: theme.sell }]}>
              {formatPrice(item.signal.stopLoss)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
          {item.feedback?.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>★ {item.feedback.rating}/5</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (signal: string, label: string) => {
    const isActive = filters.signal === signal;
    const getGradientColors = () => {
      switch (signal) {
        case 'BUY': return ['#4CAF50', '#388E3C'];
        case 'SELL': return ['#F44336', '#D32F2F'];
        case 'HOLD': return ['#FF9800', '#F57C00'];
        default: return ['#00D4FF', '#0099CC'];
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive
        ]}
        onPress={() => setFilters(prev => ({ ...prev, signal: signal as any }))}
      >
        {isActive && (
          <LinearGradient
            colors={getGradientColors()}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <Text style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Analysis History</Text>
      <Text style={styles.emptySubtitle}>
        Start analyzing trading charts to build your history
      </Text>
      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={() => navigation.navigate('Analysis' as never)}
      >
        <Text style={styles.analyzeButtonText}>Analyze Your First Chart</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerGradient: {
      paddingBottom: 20,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.error,
    },
    clearButtonText: {
      color: theme.error,
      fontSize: 12,
      fontWeight: '600',
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
    filterContainer: {
      backgroundColor: theme.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 24,
      padding: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    filterButtonActive: {
      borderColor: 'transparent',
      shadowColor: theme.primary,
      shadowOpacity: 0.3,
      elevation: 6,
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    sortContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    sortButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sortButtonActive: {
      borderColor: 'transparent',
    },
    sortButtonText: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    sortButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    analysisCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    signalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    signalBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    signalText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    confidence: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonText: {
      color: theme.error,
      fontSize: 18,
      fontWeight: 'bold',
    },
    cardContent: {
      padding: 16,
    },
    symbolRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    symbol: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    marketType: {
      fontSize: 12,
      color: theme.textSecondary,
      textTransform: 'capitalize',
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    priceItem: {
      alignItems: 'center',
      flex: 1,
    },
    priceLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    priceValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timestamp: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    ratingContainer: {
      backgroundColor: theme.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    ratingText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 48,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    analyzeButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    analyzeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      margin: 24,
      maxWidth: 400,
      width: '100%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 24,
      lineHeight: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
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
    deleteButton: {
      backgroundColor: theme.error,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.text,
    },
    deleteButtonText: {
      color: '#FFFFFF',
    },
    passwordInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.text,
      marginBottom: 8,
    },
    errorText: {
      color: theme.error,
      fontSize: 12,
      marginBottom: 16,
      marginLeft: 4,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analysis History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Analysis History</Text>
              <Text style={styles.subtitle}>Track your trading insights</Text>
            </View>
            {analyses.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearAllHistory}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {user && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.apiUsage?.totalAnalyses || 0}</Text>
                <Text style={styles.statLabel}>Total Analyses</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{user.apiUsage?.monthlyAnalyses || 0}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analyses.length}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {analyses.length > 0 && (
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            {renderFilterButton('ALL', 'All')}
            {renderFilterButton('BUY', 'Buy')}
            {renderFilterButton('SELL', 'Sell')}
            {renderFilterButton('HOLD', 'Hold')}
          </View>
          
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                filters.sortBy === 'timestamp' && styles.sortButtonActive
              ]}
              onPress={() => setFilters(prev => ({ ...prev, sortBy: 'timestamp' }))}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === 'timestamp' && styles.sortButtonTextActive
              ]}>
                Date
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortButton,
                filters.sortBy === 'confidence' && styles.sortButtonActive
              ]}
              onPress={() => setFilters(prev => ({ ...prev, sortBy: 'confidence' }))}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortBy === 'confidence' && styles.sortButtonTextActive
              ]}>
                Confidence
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sortButton,
                filters.sortOrder === 'desc' && styles.sortButtonActive
              ]}
              onPress={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' 
              }))}
            >
              <Text style={[
                styles.sortButtonText,
                filters.sortOrder === 'desc' && styles.sortButtonTextActive
              ]}>
                {filters.sortOrder === 'desc' ? '↓' : '↑'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.listContainer}>
        {filteredAnalyses.length > 0 ? (
          <FlatList
            data={filteredAnalyses}
            renderItem={renderAnalysisItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </View>
      
      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Analysis</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this analysis? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={[styles.modalButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {showClearModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear All History</Text>
            <Text style={styles.modalMessage}>
              This will permanently delete all your analysis history. Are you sure?
            </Text>
            <TextInput
              style={styles.passwordInput}
              value={clearPassword}
              onChangeText={(text) => {
                setClearPassword(text);
                setClearError('');
              }}
              placeholder="Enter your password to confirm"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />
            {clearError ? <Text style={styles.errorText}>{clearError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowClearModal(false);
                  setClearPassword('');
                  setClearError('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmClearAll}
              >
                <Text style={[styles.modalButtonText, styles.deleteButtonText]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HistoryScreen;