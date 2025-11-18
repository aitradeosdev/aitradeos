import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BlogIcon from '../../components/icons/BlogIcon';
import EditIcon from '../../components/icons/EditIcon';
import SettingsIcon from '../../components/icons/SettingsIcon';

const Tab = createBottomTabNavigator();

const BlogOverviewScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, featured: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminBlogs({ limit: 5 });
      setBlogs(response.data.blogs);
      
      // Calculate stats
      const allBlogs = await apiService.getAdminBlogs({ limit: 1000 });
      const blogList = allBlogs.data.blogs;
      setStats({
        total: blogList.length,
        published: blogList.filter(b => b.status === 'published').length,
        drafts: blogList.filter(b => b.status === 'draft').length,
        featured: blogList.filter(b => b.featured).length
      });
    } catch (error) {
      console.error('Failed to load blog data:', error);
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
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
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
      backgroundColor: theme.surface,
    },
    blogStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
    },
    blogDate: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    quickActions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blog Dashboard</Text>
        <Text style={styles.subtitle}>Manage your content</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.published}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.drafts}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.featured}</Text>
            <Text style={styles.statLabel}>Featured</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('BlogEditor' as never)}
          >
            <EditIcon size={24} color={theme.primary} />
            <Text style={styles.actionButtonText}>New Post</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('BlogList' as never)}
          >
            <BlogIcon size={24} color={theme.primary} />
            <Text style={styles.actionButtonText}>All Posts</Text>
          </TouchableOpacity>

        </View>

        {/* Recent Posts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BlogList' as never)}>
              <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
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
                  <Text style={[styles.blogStatusText, { color: 'white' }]}>
                    {blog.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.blogDate}>
                  {new Date(blog.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const BlogPostsTab = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    navigation.navigate('BlogList' as never);
  }, []);
  
  return null;
};

const BlogSettingsTab = () => {
  const { theme } = useTheme();
  const { setBlogMode } = require('../../contexts/BlogContext').useBlog();
  
  const handleBackToAdmin = async () => {
    await setBlogMode(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
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
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    button: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blog Settings</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={handleBackToAdmin}>
          <Text style={styles.buttonText}>← Back to Admin Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BlogDashboardScreen = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          
          if (route.name === 'Overview') {
            IconComponent = BlogIcon;
          } else if (route.name === 'Posts') {
            IconComponent = EditIcon;
          } else if (route.name === 'Settings') {
            IconComponent = SettingsIcon;
          }
          
          return IconComponent ? <IconComponent size={size} color={color} /> : null;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4
        }
      })}
    >
      <Tab.Screen 
        name="Overview" 
        component={BlogOverviewScreen}
        options={{ tabBarLabel: 'Overview' }}
      />
      <Tab.Screen 
        name="Posts" 
        component={BlogPostsTab}
        options={{ tabBarLabel: 'Posts' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={BlogSettingsTab}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default BlogDashboardScreen;