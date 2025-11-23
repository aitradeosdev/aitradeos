import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

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

  const handleClearAll = async () => {
    try {
      setDeleting(true);
      const response = await apiService.delete('/admin/training-data');
      setDeleteSuccess(response.data.deletedCount);
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteSuccess(null);
        loadData();
      }, 2000);
    } catch (error) {
      console.error('Clear training data error:', error);
      setDeleteSuccess(-1);
    } finally {
      setDeleting(false);
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
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    clearButton: {
      backgroundColor: '#dc3545',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    clearButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
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
    modalButtonCancel: {
      backgroundColor: theme.border,
    },
    modalButtonDelete: {
      backgroundColor: '#dc3545',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonTextCancel: {
      color: theme.text,
    },
    modalButtonTextDelete: {
      color: '#FFFFFF',
    },
    successMessage: {
      fontSize: 16,
      color: '#28a745',
      textAlign: 'center',
      fontWeight: '600',
    },
    errorMessage: {
      fontSize: 16,
      color: '#dc3545',
      textAlign: 'center',
      fontWeight: '600',
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Training Data</Text>
          <TouchableOpacity style={styles.clearButton} onPress={() => setShowDeleteModal(true)}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
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

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {deleteSuccess === null ? (
              <>
                <Text style={styles.modalTitle}>⚠️ Delete All Training Data</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to delete ALL training data? This action cannot be undone.
                </Text>
                {deleting ? (
                  <ActivityIndicator size="large" color={theme.primary} />
                ) : (
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => setShowDeleteModal(false)}
                    >
                      <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonDelete]}
                      onPress={handleClearAll}
                    >
                      <Text style={[styles.modalButtonText, styles.modalButtonTextDelete]}>Delete All</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : deleteSuccess > 0 ? (
              <Text style={styles.successMessage}>
                ✓ Successfully deleted {deleteSuccess} training records
              </Text>
            ) : (
              <Text style={styles.errorMessage}>
                ✗ Failed to clear training data
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminTrainingDataScreen;
