import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

const MarkdownRenderer = ({ content, theme }) => {
  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={i} style={[styles.h1, { color: theme.text }]}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={i} style={[styles.h2, { color: theme.text }]}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <Text key={i} style={[styles.h3, { color: theme.text }]}>
            {line.replace('### ', '')}
          </Text>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        elements.push(
          <Text key={i} style={[styles.listItem, { color: theme.text }]}>
            • {line.replace(/^[*-] /, '')}
          </Text>
        );
      } else if (line.trim() === '') {
        elements.push(<View key={i} style={{ height: 16 }} />);
      } else {
        elements.push(
          <Text key={i} style={[styles.paragraph, { color: theme.text }]}>
            {line}
          </Text>
        );
      }
    }
    
    return elements;
  };
  
  return <View>{renderMarkdown(content)}</View>;
};

const BlogDetailScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const slug = (route.params as any)?.slug;
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBlogBySlug(slug);
      setBlog(response.data.blog);
    } catch (error) {
      console.error('Failed to load blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    meta: {
      flexDirection: 'row',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    author: {
      fontSize: 14,
      color: theme.textSecondary,
      marginRight: 16,
    },
    date: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    featuredImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 24,
      backgroundColor: theme.surface,
    },
    excerpt: {
      fontSize: 18,
      lineHeight: 28,
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginBottom: 32,
      paddingLeft: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 16,
      marginTop: 32,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      marginTop: 24,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 20,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 26,
      marginBottom: 16,
    },
    listItem: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 8,
      paddingLeft: 16,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 32,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    tag: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: theme.text }}>Blog not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{blog.title}</Text>
        
        <View style={styles.meta}>
          <Text style={styles.author}>
            By {blog.author?.profile?.firstName} {blog.author?.profile?.lastName}
          </Text>
          <Text style={styles.date}>
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        {blog.featuredImage && (
          <Image source={{ uri: blog.featuredImage }} style={styles.featuredImage} />
        )}
        
        <Text style={styles.excerpt}>{blog.excerpt}</Text>
        
        <MarkdownRenderer content={blog.content} theme={theme} />
        
        {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tags}>
            {blog.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BlogDetailScreen;