import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';
import EditIcon from '../../components/icons/EditIcon';
import TrashIcon from '../../components/icons/TrashIcon';

const BlogListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ visible: false, blogId: '', title: '' });

  useEffect(() => {
    loadBlogs();
  }, [filter, search]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      
      const response = await apiService.getAdminBlogs(params);
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteModal = (blogId: string, title: string) => {
    setDeleteModal({ visible: true, blogId, title });
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteBlog(deleteModal.blogId);
      setBlogs(blogs.filter((blog: any) => blog._id !== deleteModal.blogId));
      setDeleteModal({ visible: false, blogId: '', title: '' });
      Alert.alert('Success', 'Blog deleted successfully');
    } catch (error) {
      Alert.alert('Error', `Failed to delete blog: ${error.response?.data?.error || error.message}`);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ visible: false, blogId: '', title: '' });
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    newButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    newButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    searchInput: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 16,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    blogCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    blogTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    blogExcerpt: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    blogMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    blogStatus: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    blogStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: 'white',
    },
    blogDate: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    blogActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
    },
    editButton: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    deleteButton: {
      backgroundColor: '#EF4444',
      borderColor: '#EF4444',
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
    deleteModalContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 32,
      maxWidth: 400,
      width: '100%',
    },
    deleteModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    deleteModalMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
      textAlign: 'center',
    },
    deleteModalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.surface,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    cancelButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    confirmDeleteButton: {
      flex: 1,
      backgroundColor: '#EF4444',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    confirmDeleteButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>All Posts</Text>
        </View>
        <TouchableOpacity 
          style={styles.newButton}
          onPress={() => navigation.navigate('BlogEditor' as never)}
        >
          <EditIcon size={16} color="white" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBlogs} />}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search posts..."
          placeholderTextColor={theme.textSecondary}
        />

        <View style={styles.filterContainer}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[styles.filterButton, {
                backgroundColor: filter === filterItem.key ? theme.primary : 'transparent',
                borderColor: theme.primary,
              }]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Text style={[styles.filterButtonText, {
                color: filter === filterItem.key ? 'white' : theme.primary
              }]}>
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {blogs.map((blog: any) => (
          <View key={blog._id} style={styles.blogCard}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('BlogEditor', { blogId: blog._id } as never)}
            >
              <Text style={styles.blogTitle}>{blog.title}</Text>
              <Text style={styles.blogExcerpt} numberOfLines={2}>{blog.excerpt}</Text>
            </TouchableOpacity>
            <View style={styles.blogMeta}>
              <View style={[styles.blogStatus, { 
                backgroundColor: blog.status === 'published' ? '#10B981' : '#F59E0B' 
              }]}>
                <Text style={styles.blogStatusText}>
                  {blog.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.blogActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('BlogEditor', { blogId: blog._id } as never)}
                >
                  <EditIcon size={14} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => showDeleteModal(blog._id, blog.title)}
                >
                  <TrashIcon size={14} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {deleteModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Delete Blog</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelDelete}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteButton} onPress={confirmDelete}>
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BlogListScreen;