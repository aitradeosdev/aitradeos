import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CommentIcon from '../components/icons/CommentIcon';
import EditIcon from '../components/icons/EditIcon';
import UserIcon from '../components/icons/UserIcon';
import EyeOffIcon from '../components/icons/EyeOffIcon';
import ReplyIcon from '../components/icons/ReplyIcon';
import SidewaysReplyIcon from '../components/icons/SidewaysReplyIcon';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

const MarkdownRenderer = ({ content, theme }) => {
  const markdownStyles = {
    h1: { fontSize: 32, fontWeight: 'bold', marginBottom: 16, marginTop: 32 },
    h2: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, marginTop: 24 },
    h3: { fontSize: 20, fontWeight: '600', marginBottom: 8, marginTop: 20 },
    paragraph: { fontSize: 16, lineHeight: 26, marginBottom: 16 },
    listItem: { fontSize: 16, lineHeight: 24, marginBottom: 8, paddingLeft: 16 },
    blockquote: { fontSize: 16, lineHeight: 24, fontStyle: 'italic', paddingLeft: 16, borderLeftWidth: 4, borderLeftColor: theme.primary, marginVertical: 16 }
  };

  const parseHtmlContent = (htmlContent) => {
    const elements = [];
    let elementIndex = 0;
    
    // Decode HTML entities
    const decodedContent = htmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    
    // Parse HTML content and convert to React Native components
    const lines = decodedContent.split('\n').filter(line => line.trim() && line.includes('<'));
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/<h2[^>]*>/)) {
        const text = line.replace(/<h2[^>]*>/g, '').replace(/<\/h2>/g, '').trim();
        if (text) {
          elements.push(
            <Text key={elementIndex++} style={[markdownStyles.h2, { color: theme.text }]}>
              {text}
            </Text>
          );
        }
      } else if (line.match(/<h3[^>]*>/)) {
        const text = line.replace(/<h3[^>]*>/g, '').replace(/<\/h3>/g, '').trim();
        if (text) {
          elements.push(
            <Text key={elementIndex++} style={[markdownStyles.h3, { color: theme.text }]}>
              {text}
            </Text>
          );
        }
      } else if (line.match(/<p[^>]*>/)) {
        const text = line.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '')
                        .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
                        .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
                        .replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1')
                        .replace(/<code[^>]*>(.*?)<\/code>/g, '$1')
                        .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
                        .replace(/<[^>]*>/g, '')
                        .trim();
        if (text) {
          elements.push(
            <Text key={elementIndex++} style={[markdownStyles.paragraph, { color: theme.text }]}>
              {text}
            </Text>
          );
        }
      } else if (line.match(/<blockquote[^>]*>/)) {
        const text = line.replace(/<blockquote[^>]*>/g, '').replace(/<\/blockquote>/g, '').trim();
        if (text) {
          elements.push(
            <View key={elementIndex++} style={markdownStyles.blockquote}>
              <Text style={[markdownStyles.paragraph, { color: theme.textSecondary }]}>
                {text}
              </Text>
            </View>
          );
        }
      } else if (line.match(/<ul[^>]*>/)) {
        // Handle unordered lists
        const listItems = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('</ul>')) {
          const itemLine = lines[j].trim();
          if (itemLine.match(/<li[^>]*>/)) {
            const itemText = itemLine.replace(/<li[^>]*>/g, '').replace(/<\/li>/g, '')
                                   .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
                                   .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
                                   .replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1')
                                   .replace(/<code[^>]*>(.*?)<\/code>/g, '$1')
                                   .trim();
            if (itemText) {
              listItems.push(
                <Text key={`li-${elementIndex++}`} style={[markdownStyles.listItem, { color: theme.text }]}>
                  • {itemText}
                </Text>
              );
            }
          }
          j++;
        }
        if (listItems.length > 0) {
          elements.push(
            <View key={`ul-${elementIndex++}`} style={{ marginVertical: 8 }}>
              {listItems}
            </View>
          );
        }
        i = j; // Skip processed list items
      } else if (line.match(/<ol[^>]*>/)) {
        // Handle ordered lists
        const listItems = [];
        let j = i + 1;
        let itemNumber = 1;
        while (j < lines.length && !lines[j].trim().startsWith('</ol>')) {
          const itemLine = lines[j].trim();
          if (itemLine.match(/<li[^>]*>/)) {
            const itemText = itemLine.replace(/<li[^>]*>/g, '').replace(/<\/li>/g, '')
                                   .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
                                   .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
                                   .replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1')
                                   .replace(/<code[^>]*>(.*?)<\/code>/g, '$1')
                                   .trim();
            if (itemText) {
              listItems.push(
                <Text key={`oli-${elementIndex++}`} style={[markdownStyles.listItem, { color: theme.text }]}>
                  {itemNumber++}. {itemText}
                </Text>
              );
            }
          }
          j++;
        }
        if (listItems.length > 0) {
          elements.push(
            <View key={`ol-${elementIndex++}`} style={{ marginVertical: 8 }}>
              {listItems}
            </View>
          );
        }
        i = j; // Skip processed list items
      }
    }
    
    // If no elements were parsed, render as plain text with decoded entities
    if (elements.length === 0) {
      const plainText = decodedContent.replace(/<[^>]*>/g, '').trim();
      if (plainText) {
        return [
          <Text key="fallback" style={[markdownStyles.paragraph, { color: theme.text }]}>
            {plainText}
          </Text>
        ];
      }
    }
    return elements;
  };
  
  return <View>{parseHtmlContent(content)}</View>;
};

const BlogDetailScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const slug = (route.params as any)?.slug;
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '', isAnonymous: true, parentId: null });
  const [submitting, setSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});

  const submitComment = async () => {
    if (!commentForm.email || !commentForm.comment) {
      Alert.alert('Error', 'Email and comment are required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.postComment(slug, commentForm);
      setComments([response.data.comment, ...comments]);
      setCommentForm({ name: '', email: '', comment: '', isAnonymous: true, parentId: null });
      setShowCommentForm(false);
      setReplyingTo(null);
      Alert.alert('Success', 'Comment posted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (comment) => {
    setReplyingTo(comment);
    setCommentForm({ ...commentForm, parentId: comment._id });
    setShowCommentForm(true);
  };

  const organizeComments = (comments) => {
    const topLevel = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);
    
    return topLevel.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parentId === comment._id)
    }));
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

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
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to load blog:', error);
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
      paddingBottom: 10,
    },
    backButton: {
      alignSelf: 'flex-start',
      padding: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: 'black',
      fontWeight: '600',
    },
    content: {
      padding: 24,
      maxWidth: '100vw',
      boxSizing: 'border-box',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'black',
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
      color: '#666',
      marginRight: 16,
    },
    date: {
      fontSize: 14,
      color: '#666',
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
    commentsSection: {
      marginTop: 32,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    commentsHeader: {
      marginBottom: 20,
    },
    commentsCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    commentsCountText: {
      fontSize: 18,
      fontWeight: '600',
      color: 'black',
    },
    addCommentButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: 'black',
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      zIndex: 1000,
    },
    addCommentButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
    commentFormModal: {
      position: 'absolute',
      bottom: 90,
      right: 20,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      width: 320,
      maxWidth: '90%',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 999,
    },
    commentFormHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    commentFormTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: 'black',
    },
    anonymousToggle: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 2,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      gap: 6,
    },
    toggleActive: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    toggleTextActive: {
      color: 'white',
    },
    modernInput: {
      backgroundColor: '#f9fafb',
      borderColor: 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: 'black',
      marginBottom: 12,
    },
    commentTextArea: {
      minHeight: 60,
      textAlignVertical: 'top',
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: '#f3f4f6',
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    cancelButtonText: {
      color: 'black',
      fontSize: 14,
      fontWeight: '600',
    },
    modernSubmitButton: {
      flex: 2,
      backgroundColor: 'black',
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: 'center',
    },
    modernSubmitButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    commentsList: {
      marginTop: 16,
    },
    noComments: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 12,
    },
    noCommentsText: {
      fontSize: 18,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    noCommentsSubtext: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    modernCommentItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    commentText: {
      fontSize: 16,
      color: 'black',
      lineHeight: 24,
      marginBottom: 12,
    },
    commentFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    replyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    replyButtonText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    showRepliesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
      marginRight: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    replyItem: {
      paddingVertical: 12,
      paddingLeft: 32,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    commentAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '700',
    },
    commentAuthor: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    commentDate: {
      fontSize: 12,
      color: theme.textSecondary,
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('PublicBlogList' as never);
            }
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
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
          blog.featuredImage.includes('/blog-videos/') ? (
            <video 
              src={blog.featuredImage.startsWith('http') ? blog.featuredImage : `${apiService.getApiUrl().replace('/api', '')}${blog.featuredImage}`}
              style={styles.featuredImage}
              controls
              poster={blog.featuredImage.replace('/blog-videos/', '/blog-images/').replace(/\.[^.]+$/, '.jpg')}
            />
          ) : (
            <Image 
              source={{ uri: blog.featuredImage.startsWith('http') ? blog.featuredImage : `${apiService.getApiUrl().replace('/api', '')}${blog.featuredImage}` }} 
              style={styles.featuredImage} 
              resizeMode="cover"
            />
          )
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
        
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <View style={styles.commentsCount}>
              <CommentIcon size={20} color={theme.text} />
              <Text style={styles.commentsCountText}>{comments.length} Comments</Text>
            </View>
          </View>
          
          <View style={styles.commentsList}>
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <CommentIcon size={48} color={theme.textSecondary} />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts!</Text>
              </View>
            ) : (
              organizeComments(comments).map((comment, index) => (
                <View key={index}>
                  <View style={styles.modernCommentItem}>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                    <View style={styles.commentFooter}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.avatarText}>{comment.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <Text style={styles.commentAuthor}>{comment.name}</Text>
                      <Text style={styles.commentDate}>• {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                      {comment.replies && comment.replies.length > 0 && (
                        <TouchableOpacity 
                          style={styles.showRepliesButton}
                          onPress={() => toggleReplies(comment._id)}
                        >
                          <SidewaysReplyIcon size={12} color={theme.textSecondary} />
                          <Text style={styles.replyButtonText}>
                            {showReplies[comment._id] ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={styles.replyButton}
                        onPress={() => startReply(comment)}
                      >
                        <ReplyIcon size={12} color={theme.textSecondary} />
                        <Text style={styles.replyButtonText}>Reply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {showReplies[comment._id] && comment.replies && comment.replies.map((reply, replyIndex) => (
                    <View key={replyIndex} style={styles.replyItem}>
                      <Text style={styles.commentText}>{reply.comment}</Text>
                      <View style={styles.commentFooter}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.avatarText}>{reply.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.commentAuthor}>{reply.name}</Text>
                        <Text style={styles.commentDate}>• {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
          
          {!showCommentForm && (
            <TouchableOpacity 
              style={styles.addCommentButton}
              onPress={() => setShowCommentForm(true)}
            >
              <EditIcon size={20} color="white" />
            </TouchableOpacity>
          )}
          
          {showCommentForm && (
            <View style={styles.commentFormModal}>
              <View style={styles.commentFormHeader}>
                <Text style={styles.commentFormTitle}>
                  {replyingTo ? `Reply` : 'Comment'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowCommentForm(false);
                  setReplyingTo(null);
                  setCommentForm({ name: '', email: '', comment: '', isAnonymous: true, parentId: null });
                }}>
                  <Text style={{ fontSize: 18, color: '#666' }}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.anonymousToggle}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !commentForm.isAnonymous && styles.toggleActive]}
                    onPress={() => setCommentForm({...commentForm, isAnonymous: !commentForm.isAnonymous})}
                  >
                    {commentForm.isAnonymous ? (
                      <EyeOffIcon size={16} color={commentForm.isAnonymous ? theme.textSecondary : 'white'} />
                    ) : (
                      <UserIcon size={16} color={!commentForm.isAnonymous ? 'white' : theme.textSecondary} />
                    )}
                    <Text style={[styles.toggleText, !commentForm.isAnonymous && styles.toggleTextActive]}>
                      {commentForm.isAnonymous ? 'Anonymous' : 'Show Name'}
                    </Text>
                  </TouchableOpacity>
              </View>
              
              {!commentForm.isAnonymous && (
                <TextInput
                  style={styles.modernInput}
                  value={commentForm.name}
                  onChangeText={(text) => setCommentForm({...commentForm, name: text})}
                  placeholder="Your name"
                  placeholderTextColor="#999"
                />
              )}
              
              <TextInput
                style={styles.modernInput}
                value={commentForm.email}
                onChangeText={(text) => setCommentForm({...commentForm, email: text})}
                placeholder="Email (required)"
                placeholderTextColor="#999"
                keyboardType="email-address"
              />
              
              <TextInput
                style={[styles.modernInput, styles.commentTextArea]}
                value={commentForm.comment}
                onChangeText={(text) => setCommentForm({...commentForm, comment: text})}
                placeholder="Your comment..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCommentForm(false);
                    setReplyingTo(null);
                    setCommentForm({ name: '', email: '', comment: '', isAnonymous: true, parentId: null });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modernSubmitButton}
                  onPress={submitComment}
                  disabled={submitting}
                >
                  <Text style={styles.modernSubmitButtonText}>
                    {submitting ? 'Publishing...' : 'Publish Comment'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BlogDetailScreen;