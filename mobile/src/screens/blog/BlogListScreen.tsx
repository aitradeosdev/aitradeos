import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';
import EditIcon from '../../components/icons/EditIcon';

const BlogListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Posts</Text>
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
          <TouchableOpacity 
            key={blog._id} 
            style={styles.blogCard}
            onPress={() => navigation.navigate('BlogEditor', { blogId: blog._id } as never)}
          >
            <Text style={styles.blogTitle}>{blog.title}</Text>
            <Text style={styles.blogExcerpt} numberOfLines={2}>{blog.excerpt}</Text>
            <View style={styles.blogMeta}>
              <View style={[styles.blogStatus, { 
                backgroundColor: blog.status === 'published' ? '#10B981' : '#F59E0B' 
              }]}>
                <Text style={styles.blogStatusText}>
                  {blog.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.blogDate}>
                {new Date(blog.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default BlogListScreen;