import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const BlogEditorScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const blogId = (route.params as any)?.blogId;

  const [blog, setBlog] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: [],
    category: 'General',
    status: 'draft',
    featured: false
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const loadBlog = async () => {
    try {
      const response = await apiService.getBlogById(blogId);
      setBlog(response.data.blog);
    } catch (error) {
      Alert.alert('Error', 'Failed to load blog');
    }
  };

  const saveBlog = async () => {
    if (!blog.title || !blog.content || !blog.excerpt) {
      Alert.alert('Error', 'Please fill in title, content, and excerpt');
      return;
    }

    try {
      setSaving(true);
      if (blogId) {
        await apiService.updateBlog(blogId, blog);
        Alert.alert('Success', 'Blog updated successfully');
      } else {
        await apiService.createBlog(blog);
        Alert.alert('Success', 'Blog created successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !blog.tags.includes(tagInput.trim())) {
      setBlog({ ...blog, tags: [...blog.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setBlog({ ...blog, tags: blog.tags.filter(t => t !== tag) });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (asset: any) => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      (formData as any).append('image', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'blog-image.jpg',
      });

      const response = await apiService.post('/blog/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBlog({ ...blog, featuredImage: response.data.imageUrl });
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) {
      Alert.alert('Error', 'Please enter a topic for AI generation');
      return;
    }

    try {
      setGenerating(true);
      const response = await apiService.generateBlog(aiTopic);
      const { title, excerpt, content } = response.data;
      
      setBlog({ ...blog, title, excerpt, content });
      setAiTopic('');
      Alert.alert('Success', 'Blog content generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate blog content');
    } finally {
      setGenerating(false);
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
    saveButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    input: {
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
    textArea: {
      minHeight: 200,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    tag: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    tagText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
    },
    tagRemove: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    tagInputContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    tagInput: {
      flex: 1,
    },
    addTagButton: {
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    addTagButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    toggle: {
      width: 50,
      height: 30,
      borderRadius: 15,
      padding: 2,
      justifyContent: 'center',
    },
    toggleThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'white',
    },
    statusButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statusButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
    },
    statusButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    aiSection: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    aiTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    aiInputContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    aiInput: {
      flex: 1,
    },
    aiButton: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    aiButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    imageSection: {
      marginBottom: 16,
    },
    imagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    imageButton: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    imageButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{blogId ? 'Edit Post' : 'New Post'}</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveBlog}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.aiSection}>
          <Text style={styles.aiTitle}>✨ AI Blog Generator</Text>
          <View style={styles.aiInputContainer}>
            <TextInput
              style={[styles.input, styles.aiInput]}
              value={aiTopic}
              onChangeText={setAiTopic}
              placeholder="Enter topic (e.g., 'AI in trading', 'Market analysis')..."
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity 
              style={styles.aiButton} 
              onPress={generateWithAI}
              disabled={generating}
            >
              <Text style={styles.aiButtonText}>{generating ? 'Generating...' : 'Generate'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.label}>Featured Image</Text>
          {blog.featuredImage && (
            <Image source={{ uri: blog.featuredImage }} style={styles.imagePreview} />
          )}
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Text style={styles.imageButtonText}>
              {uploadingImage ? 'Uploading...' : blog.featuredImage ? 'Change Image' : 'Add Featured Image'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={blog.title}
          onChangeText={(text) => setBlog({ ...blog, title: text })}
          placeholder="Enter blog title..."
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Excerpt</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={blog.excerpt}
          onChangeText={(text) => setBlog({ ...blog, excerpt: text })}
          placeholder="Brief description..."
          placeholderTextColor={theme.textSecondary}
          multiline
        />

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={blog.content}
          onChangeText={(text) => setBlog({ ...blog, content: text })}
          placeholder="Write your blog content here..."
          placeholderTextColor={theme.textSecondary}
          multiline
        />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagContainer}>
          {blog.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={[styles.input, styles.tagInput]}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add tag..."
            placeholderTextColor={theme.textSecondary}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Text style={styles.addTagButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={blog.category}
          onChangeText={(text) => setBlog({ ...blog, category: text })}
          placeholder="Category..."
          placeholderTextColor={theme.textSecondary}
        />

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Featured Post</Text>
          <TouchableOpacity
            style={[styles.toggle, { backgroundColor: blog.featured ? theme.primary : '#ccc' }]}
            onPress={() => setBlog({ ...blog, featured: !blog.featured })}
          >
            <View style={[styles.toggleThumb, { 
              alignSelf: blog.featured ? 'flex-end' : 'flex-start' 
            }]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[styles.statusButton, {
              backgroundColor: blog.status === 'draft' ? theme.primary : 'transparent',
              borderColor: theme.primary,
            }]}
            onPress={() => setBlog({ ...blog, status: 'draft' })}
          >
            <Text style={[styles.statusButtonText, {
              color: blog.status === 'draft' ? 'white' : theme.primary
            }]}>Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, {
              backgroundColor: blog.status === 'published' ? theme.primary : 'transparent',
              borderColor: theme.primary,
            }]}
            onPress={() => setBlog({ ...blog, status: 'published' })}
          >
            <Text style={[styles.statusButtonText, {
              color: blog.status === 'published' ? 'white' : theme.primary
            }]}>Publish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BlogEditorScreen;