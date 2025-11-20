import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Platform, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

const PublicBlogListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPublicBlogs({ limit: 50 });
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
      backgroundColor: 'white',
      maxWidth: '100vw',
      overflowX: 'hidden',
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    backButton: {
      alignSelf: 'flex-start',
      padding: 8,
      marginBottom: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: 'black',
      fontWeight: '600',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'black',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      maxWidth: '100vw',
      boxSizing: 'border-box',
    },
    blogCard: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    blogImage: {
      width: '100%',
      height: 120,
      borderRadius: 6,
      marginBottom: 12,
      backgroundColor: '#f3f4f6',
    },
    blogTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'black',
      marginBottom: 8,
    },
    blogExcerpt: {
      fontSize: 14,
      color: '#666',
      marginBottom: 12,
      lineHeight: 20,
    },
    blogMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    blogAuthor: {
      fontSize: 12,
      color: '#666',
    },
    blogDate: {
      fontSize: 12,
      color: '#666',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.location.href = '/';
            } else {
              navigation.navigate('Landing' as never);
            }
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Blog</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBlogs} />}
        showsVerticalScrollIndicator={false}
      >
        {blogs.map((blog: any) => (
          <TouchableOpacity 
            key={blog._id} 
            style={styles.blogCard}
            onPress={() => navigation.navigate('BlogDetail', { slug: blog.slug } as never)}
          >
            {blog.featuredImage && (
              blog.featuredImage.includes('/blog-videos/') ? (
                <video 
                  src={blog.featuredImage.startsWith('http') ? blog.featuredImage : `${apiService.getApiUrl().replace('/api', '')}${blog.featuredImage}`}
                  style={styles.blogImage}
                  controls={false}
                  muted
                  poster={blog.featuredImage.replace('/blog-videos/', '/blog-images/').replace(/\.[^.]+$/, '.jpg')}
                />
              ) : (
                <Image 
                  source={{ uri: blog.featuredImage.startsWith('http') ? blog.featuredImage : `${apiService.getApiUrl().replace('/api', '')}${blog.featuredImage}` }} 
                  style={styles.blogImage} 
                  resizeMode="cover"
                />
              )
            )}
            <Text style={styles.blogTitle}>{blog.title}</Text>
            <Text style={styles.blogExcerpt} numberOfLines={2}>{blog.excerpt}</Text>
            <View style={styles.blogMeta}>
              <Text style={styles.blogAuthor}>
                By {blog.author?.profile?.firstName} {blog.author?.profile?.lastName}
              </Text>
              <Text style={styles.blogDate}>
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default PublicBlogListScreen;