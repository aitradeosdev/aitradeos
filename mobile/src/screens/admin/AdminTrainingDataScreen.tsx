import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';

const AdminTrainingDataScreen = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, dataRes] = await Promise.all([
        apiService.get('/admin/training-data/stats'),
        apiService.get(`/admin/training-data?hasFeedback=${filter === 'feedback'}&page=${page}`)
      ]);
      setStats(statsRes.data);
      setTrainingData(dataRes.data.trainingData);
      setPagination(dataRes.data.pagination);
    } catch (error) {
      console.error('Failed to load training data:', error);
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
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 12,
      minWidth: 150,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primary,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    filterContainer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.surface,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
    },
    filterText: {
      color: theme.text,
      fontWeight: '600',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    dataList: {
      padding: 20,
    },
    dataCard: {
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    dataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    dataLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    dataValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    star: {
      color: '#FFD700',
      fontSize: 16,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      marginTop: 20,
    },
    pageButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    pageButtonDisabled: {
      backgroundColor: theme.surface,
      opacity: 0.5,
    },
    pageButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    pageInfo: {
      color: theme.text,
      fontSize: 14,
    },
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Data</Text>
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.withFeedback}</Text>
              <Text style={styles.statLabel}>With Feedback</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'feedback' && styles.filterButtonActive]}
          onPress={() => setFilter('feedback')}
        >
          <Text style={[styles.filterText, filter === 'feedback' && styles.filterTextActive]}>
            With Feedback
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.dataList}>
        {trainingData.length === 0 ? (
          <Text style={[styles.dataLabel, { textAlign: 'center', marginTop: 40 }]}>No training data found</Text>
        ) : (
          trainingData.map((data, index) => (
            <View key={index} style={styles.dataCard}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Hash</Text>
                <Text style={[styles.dataValue, { fontSize: 12 }]}>{data.imageHash?.substring(0, 16)}...</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Signal</Text>
                <Text style={styles.dataValue}>{data.aiAnalysis?.signal?.action || 'N/A'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Confidence</Text>
                <Text style={styles.dataValue}>{data.aiAnalysis?.signal?.confidence || 0}%</Text>
              </View>
              {data.aiAnalysis?.signal?.entryPoint && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Entry</Text>
                  <Text style={styles.dataValue}>{data.aiAnalysis.signal.entryPoint}</Text>
                </View>
              )}
              {data.chartAnalysis?.symbol && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Symbol</Text>
                  <Text style={styles.dataValue}>{data.chartAnalysis.symbol}</Text>
                </View>
              )}
              {data.feedback?.userRating && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>User Rating</Text>
                  <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                      <Text key={i} style={styles.star}>
                        {i < data.feedback.userRating ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Created</Text>
                <Text style={styles.dataValue}>
                  {new Date(data.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
        {pagination && pagination.pages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>Page {page} of {pagination.pages}</Text>
            <TouchableOpacity
              style={[styles.pageButton, page === pagination.pages && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminTrainingDataScreen;
