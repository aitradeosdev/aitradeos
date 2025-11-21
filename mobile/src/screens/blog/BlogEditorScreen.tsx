import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, Platform, Modal, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { WebView } from 'react-native-webview';

const BlogEditorScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const blogId = (route.params as any)?.blogId;
  const webViewRef = useRef(null);

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
  const [editorMode, setEditorMode] = useState('visual'); // 'visual', 'source', 'preview'
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [deleteModal, setDeleteModal] = useState(false);
  const contentInputRef = useRef(null);
  const { width } = Dimensions.get('window');

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

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadMedia(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const uploadMedia = async (asset: any) => {
    try {
      setUploadingImage(true);
      
      const isVideo = asset.type === 'video';
      const ext = isVideo ? '.mp4' : '.jpg';
      const fileName = `blog-${Date.now()}${ext}`;
      const mediaType = isVideo ? 'video' : 'image';
      
      const response = await apiService.uploadBlogMedia(asset.uri, fileName, mediaType);

      setBlog({ ...blog, featuredImage: response.data.mediaUrl });
      Alert.alert('Success', `${isVideo ? 'Video' : 'Image'} uploaded successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload media');
    } finally {
      setUploadingImage(false);
    }
  };

  const showDeleteModal = () => {
    if (!blogId) return;
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteBlog(blogId);
      setDeleteModal(false);
      Alert.alert('Success', 'Blog deleted successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete blog');
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) {
      Alert.alert('Error', 'Please enter a topic for AI generation');
      return;
    }

    try {
      setGenerating(true);
      const response = await apiService.generateBlog(aiTopic);
      console.log('AI Response:', response.data);
      
      const { title, excerpt, content } = response.data;
      
      if (!title || !excerpt || !content) {
        console.error('Missing fields in response:', { title, excerpt, content });
        Alert.alert('Error', 'AI generated incomplete content. Please try again.');
        return;
      }
      
      setBlog(prev => ({ ...prev, title, excerpt, content }));
      setAiTopic('');
      Alert.alert('Success', 'Blog content generated successfully!');
    } catch (error) {
      console.error('AI Generation Error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to generate blog content');
    } finally {
      setGenerating(false);
    }
  };

  const insertFormatting = (format, options = {}) => {
    const { start, end } = cursorPosition;
    const currentContent = blog.content;
    let newContent = '';
    let insertText = '';

    switch (format) {
      case 'h1': insertText = `<h1>${selectedText || 'Heading 1'}</h1>\n`; break;
      case 'h2': insertText = `<h2>${selectedText || 'Heading 2'}</h2>\n`; break;
      case 'h3': insertText = `<h3>${selectedText || 'Heading 3'}</h3>\n`; break;
      case 'h4': insertText = `<h4>${selectedText || 'Heading 4'}</h4>\n`; break;
      case 'h5': insertText = `<h5>${selectedText || 'Heading 5'}</h5>\n`; break;
      case 'h6': insertText = `<h6>${selectedText || 'Heading 6'}</h6>\n`; break;
      case 'bold': insertText = selectedText ? `<strong>${selectedText}</strong>` : '<strong>Bold text</strong>'; break;
      case 'italic': insertText = selectedText ? `<em>${selectedText}</em>` : '<em>Italic text</em>'; break;
      case 'underline': insertText = selectedText ? `<u>${selectedText}</u>` : '<u>Underlined text</u>'; break;
      case 'strikethrough': insertText = selectedText ? `<s>${selectedText}</s>` : '<s>Strikethrough text</s>'; break;
      case 'superscript': insertText = selectedText ? `<sup>${selectedText}</sup>` : '<sup>Superscript</sup>'; break;
      case 'subscript': insertText = selectedText ? `<sub>${selectedText}</sub>` : '<sub>Subscript</sub>'; break;
      case 'code': insertText = selectedText ? `<code>${selectedText}</code>` : '<code>Code</code>'; break;
      case 'pre': insertText = `<pre><code>${selectedText || 'Code block'}</code></pre>\n`; break;
      case 'ul': insertText = `<ul>\n<li>List item 1</li>\n<li>List item 2</li>\n<li>List item 3</li>\n</ul>\n`; break;
      case 'ol': insertText = `<ol>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ol>\n`; break;
      case 'quote': insertText = `<blockquote>${selectedText || 'Quote text here'}</blockquote>\n`; break;
      case 'hr': insertText = `<hr>\n`; break;
      case 'br': insertText = `<br>\n`; break;
      case 'p': insertText = `<p>${selectedText || 'Paragraph text'}</p>\n`; break;
      case 'div': insertText = `<div>${selectedText || 'Division content'}</div>\n`; break;
      case 'span': insertText = selectedText ? `<span>${selectedText}</span>` : '<span>Span text</span>'; break;
      case 'mark': insertText = selectedText ? `<mark>${selectedText}</mark>` : '<mark>Highlighted text</mark>'; break;
      case 'small': insertText = selectedText ? `<small>${selectedText}</small>` : '<small>Small text</small>'; break;
      case 'center': insertText = `<div style="text-align: center;">${selectedText || 'Centered text'}</div>\n`; break;
      case 'left': insertText = `<div style="text-align: left;">${selectedText || 'Left aligned text'}</div>\n`; break;
      case 'right': insertText = `<div style="text-align: right;">${selectedText || 'Right aligned text'}</div>\n`; break;
      case 'justify': insertText = `<div style="text-align: justify;">${selectedText || 'Justified text'}</div>\n`; break;
      case 'indent': insertText = `<div style="margin-left: 40px;">${selectedText || 'Indented text'}</div>\n`; break;
      case 'outdent': insertText = `<div style="margin-left: -40px;">${selectedText || 'Outdented text'}</div>\n`; break;
      default: insertText = `<p>${selectedText || 'New paragraph'}</p>\n`;
    }

    if (selectedText && ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'code', 'span', 'mark', 'small'].includes(format)) {
      newContent = currentContent.substring(0, start) + insertText + currentContent.substring(end);
    } else {
      newContent = currentContent.substring(0, start) + insertText + currentContent.substring(start);
    }

    setBlog({ ...blog, content: newContent });
    setShowFormatModal(false);
  };

  const insertTable = () => {
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%;">\n';
    
    // Header row
    tableHtml += '<tr>\n';
    for (let j = 0; j < cols; j++) {
      tableHtml += `<th style="padding: 8px; background-color: #f5f5f5;">Header ${j + 1}</th>\n`;
    }
    tableHtml += '</tr>\n';
    
    // Data rows
    for (let i = 1; i < rows; i++) {
      tableHtml += '<tr>\n';
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td style="padding: 8px;">Cell ${i + 1}-${j + 1}</td>\n`;
      }
      tableHtml += '</tr>\n';
    }
    tableHtml += '</table>\n';
    
    const { start } = cursorPosition;
    const currentContent = blog.content;
    const newContent = currentContent.substring(0, start) + tableHtml + currentContent.substring(start);
    setBlog({ ...blog, content: newContent });
    setShowTableModal(false);
    setTableRows('3');
    setTableCols('3');
  };

  const insertLink = () => {
    if (!linkUrl) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }
    const linkHtml = `<a href="${linkUrl}" target="_blank">${linkText || selectedText || linkUrl}</a>`;
    const { start, end } = cursorPosition;
    const currentContent = blog.content;
    const newContent = selectedText 
      ? currentContent.substring(0, start) + linkHtml + currentContent.substring(end)
      : currentContent.substring(0, start) + linkHtml + currentContent.substring(start);
    setBlog({ ...blog, content: newContent });
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertImage = () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }
    const imgHtml = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;">\n`;
    const { start } = cursorPosition;
    const currentContent = blog.content;
    const newContent = currentContent.substring(0, start) + imgHtml + currentContent.substring(start);
    setBlog({ ...blog, content: newContent });
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
  };

  const applyTextStyle = (style, value) => {
    if (!selectedText) {
      Alert.alert('Info', 'Please select text first');
      return;
    }
    let styledText = '';
    switch (style) {
      case 'fontSize':
        styledText = `<span style="font-size: ${value}px;">${selectedText}</span>`;
        break;
      case 'color':
        styledText = `<span style="color: ${value};">${selectedText}</span>`;
        break;
      case 'backgroundColor':
        styledText = `<span style="background-color: ${value};">${selectedText}</span>`;
        break;
    }
    const { start, end } = cursorPosition;
    const currentContent = blog.content;
    const newContent = currentContent.substring(0, start) + styledText + currentContent.substring(end);
    setBlog({ ...blog, content: newContent });
  };

  const handleContentSelection = (event) => {
    const { selection } = event.nativeEvent;
    if (selection) {
      setCursorPosition({ start: selection.start, end: selection.end });
      const selected = blog.content.substring(selection.start, selection.end);
      setSelectedText(selected);
    }
  };

  const getPreviewHtml = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blog Preview</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: ${theme.text};
                background: ${theme.background};
                padding: 20px;
                margin: 0;
            }
            h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
            h1 { font-size: 32px; }
            h2 { font-size: 24px; }
            h3 { font-size: 20px; }
            h4 { font-size: 18px; }
            h5 { font-size: 16px; }
            h6 { font-size: 14px; }
            p { margin-bottom: 16px; }
            ul, ol { margin-bottom: 16px; padding-left: 24px; }
            li { margin-bottom: 8px; }
            blockquote {
                border-left: 4px solid ${theme.primary};
                padding-left: 16px;
                margin: 16px 0;
                font-style: italic;
                color: ${theme.textSecondary};
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 16px 0;
            }
            th, td {
                border: 1px solid ${theme.border};
                padding: 8px;
                text-align: left;
            }
            th {
                background: ${theme.surface};
                font-weight: bold;
            }
            code {
                background: ${theme.surface};
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }
            pre {
                background: ${theme.surface};
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                margin: 16px 0;
            }
            pre code {
                background: none;
                padding: 0;
            }
            img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 16px 0;
            }
            a {
                color: ${theme.primary};
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            hr {
                border: none;
                border-top: 1px solid ${theme.border};
                margin: 24px 0;
            }
        </style>
    </head>
    <body>
        ${blog.content}
    </body>
    </html>
    `;
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
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
    deleteButton: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    deleteButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
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
      backgroundColor: '#f3f4f6',
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
    editorSection: {
      marginBottom: 16,
    },
    editorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    editorModeToggle: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 6,
      padding: 2,
    },
    modeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
    },
    modeButtonActive: {
      backgroundColor: theme.primary,
    },
    modeButtonText: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '500',
    },
    modeButtonTextActive: {
      color: 'white',
    },
    toolbar: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      paddingVertical: 8,
    },
    toolbarContent: {
      flexDirection: 'row',
      paddingHorizontal: 8,
      gap: 4,
    },
    toolButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toolButtonText: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '500',
    },
    sourceEditor: {
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontSize: 12,
      backgroundColor: theme.surface,
    },
    formatModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    formatModalContent: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 300,
    },
    formatModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    formatOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    formatOptionText: {
      fontSize: 16,
      color: theme.text,
    },
    formatModalClose: {
      marginTop: 16,
      backgroundColor: theme.surface,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    formatModalCloseText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '500',
    },
    advancedToolbar: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      paddingVertical: 6,
    },
    previewContainer: {
      height: 400,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    previewWebView: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalInput: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.text,
      marginBottom: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

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
          <Text style={styles.title}>{blogId ? 'Edit Post' : 'New Post'}</Text>
        </View>
        <View style={styles.headerRight}>
          {blogId && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={showDeleteModal}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveBlog}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.label}>Featured Media</Text>
          {blog.featuredImage && (
            blog.featuredImage.includes('/blog-videos/') ? (
              <video 
                src={blog.featuredImage}
                style={styles.imagePreview}
                controls
              />
            ) : (
              <Image source={{ uri: blog.featuredImage }} style={styles.imagePreview} />
            )
          )}
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={pickMedia}
            disabled={uploadingImage}
          >
            <Text style={styles.imageButtonText}>
              {uploadingImage ? 'Uploading...' : blog.featuredImage ? 'Change Media' : 'Add Featured Image/Video'}
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

        <View style={styles.editorSection}>
          <View style={styles.editorHeader}>
            <Text style={styles.label}>Content</Text>
            <View style={styles.editorModeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, editorMode === 'visual' && styles.modeButtonActive]}
                onPress={() => setEditorMode('visual')}
              >
                <Text style={[styles.modeButtonText, editorMode === 'visual' && styles.modeButtonTextActive]}>Visual</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, editorMode === 'source' && styles.modeButtonActive]}
                onPress={() => setEditorMode('source')}
              >
                <Text style={[styles.modeButtonText, editorMode === 'source' && styles.modeButtonTextActive]}>HTML</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, editorMode === 'preview' && styles.modeButtonActive]}
                onPress={() => setEditorMode('preview')}
              >
                <Text style={[styles.modeButtonText, editorMode === 'preview' && styles.modeButtonTextActive]}>Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {editorMode === 'visual' && (
            <View>
              <View style={styles.toolbar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.toolbarContent}>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('h1')}>
                      <Text style={styles.toolButtonText}>H1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('h2')}>
                      <Text style={styles.toolButtonText}>H2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('h3')}>
                      <Text style={styles.toolButtonText}>H3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('bold')}>
                      <Text style={[styles.toolButtonText, { fontWeight: 'bold' }]}>B</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('italic')}>
                      <Text style={[styles.toolButtonText, { fontStyle: 'italic' }]}>I</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('underline')}>
                      <Text style={[styles.toolButtonText, { textDecorationLine: 'underline' }]}>U</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('strikethrough')}>
                      <Text style={[styles.toolButtonText, { textDecorationLine: 'line-through' }]}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('ul')}>
                      <Text style={styles.toolButtonText}>•</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('ol')}>
                      <Text style={styles.toolButtonText}>1.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('quote')}>
                      <Text style={styles.toolButtonText}>"</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => setShowLinkModal(true)}>
                      <Text style={styles.toolButtonText}>🔗</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => setShowTableModal(true)}>
                      <Text style={styles.toolButtonText}>⊞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => setShowImageModal(true)}>
                      <Text style={styles.toolButtonText}>🖼</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('code')}>
                      <Text style={styles.toolButtonText}>&lt;/&gt;</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('hr')}>
                      <Text style={styles.toolButtonText}>---</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => setShowFormatModal(true)}>
                      <Text style={styles.toolButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
              
              <View style={styles.advancedToolbar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.toolbarContent}>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('center')}>
                      <Text style={styles.toolButtonText}>Center</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('left')}>
                      <Text style={styles.toolButtonText}>Left</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('right')}>
                      <Text style={styles.toolButtonText}>Right</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('justify')}>
                      <Text style={styles.toolButtonText}>Justify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('indent')}>
                      <Text style={styles.toolButtonText}>Indent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('superscript')}>
                      <Text style={styles.toolButtonText}>X²</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('subscript')}>
                      <Text style={styles.toolButtonText}>X₂</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('mark')}>
                      <Text style={styles.toolButtonText}>Mark</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton} onPress={() => insertFormatting('small')}>
                      <Text style={styles.toolButtonText}>Small</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
          
          {editorMode === 'preview' ? (
            <View style={styles.previewContainer}>
              <WebView
                ref={webViewRef}
                source={{ html: getPreviewHtml() }}
                style={styles.previewWebView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          ) : (
            <TextInput
              ref={contentInputRef}
              style={[styles.input, styles.textArea, editorMode === 'source' && styles.sourceEditor]}
              value={blog.content}
              onChangeText={(text) => setBlog({ ...blog, content: text })}
              onSelectionChange={handleContentSelection}
              placeholder={editorMode === 'visual' ? "Start writing your blog content here...\n\nUse the toolbar above to format your text." : "<p>HTML content here...</p>"}
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
            />
          )}
        </View>

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
      
      {/* Advanced Format Modal */}
      <Modal
        visible={showFormatModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFormatModal(false)}
      >
        <View style={styles.formatModal}>
          <View style={styles.formatModalContent}>
            <Text style={styles.formatModalTitle}>Advanced Formatting</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('h4')}>
                <Text style={styles.formatOptionText}>Heading 4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('h5')}>
                <Text style={styles.formatOptionText}>Heading 5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('h6')}>
                <Text style={styles.formatOptionText}>Heading 6</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('pre')}>
                <Text style={styles.formatOptionText}>Code Block</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('p')}>
                <Text style={styles.formatOptionText}>Paragraph</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('div')}>
                <Text style={styles.formatOptionText}>Division</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('span')}>
                <Text style={styles.formatOptionText}>Span</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formatOption} onPress={() => insertFormatting('br')}>
                <Text style={styles.formatOptionText}>Line Break</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity 
              style={styles.formatModalClose} 
              onPress={() => setShowFormatModal(false)}
            >
              <Text style={styles.formatModalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Link Modal */}
      <Modal
        visible={showLinkModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.formatModal}>
          <View style={styles.formatModalContent}>
            <Text style={styles.formatModalTitle}>Insert Link</Text>
            <TextInput
              style={styles.modalInput}
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="Enter URL (https://example.com)"
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              value={linkText}
              onChangeText={setLinkText}
              placeholder="Link text (optional)"
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={insertLink}>
                <Text style={styles.modalButtonText}>Insert</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowLinkModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Table Modal */}
      <Modal
        visible={showTableModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTableModal(false)}
      >
        <View style={styles.formatModal}>
          <View style={styles.formatModalContent}>
            <Text style={styles.formatModalTitle}>Insert Table</Text>
            <TextInput
              style={styles.modalInput}
              value={tableRows}
              onChangeText={setTableRows}
              placeholder="Number of rows"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              value={tableCols}
              onChangeText={setTableCols}
              placeholder="Number of columns"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={insertTable}>
                <Text style={styles.modalButtonText}>Insert</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowTableModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.formatModal}>
          <View style={styles.formatModalContent}>
            <Text style={styles.formatModalTitle}>Insert Image</Text>
            <TextInput
              style={styles.modalInput}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="Image URL (https://example.com/image.jpg)"
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              style={styles.modalInput}
              value={imageAlt}
              onChangeText={setImageAlt}
              placeholder="Alt text (optional)"
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={insertImage}>
                <Text style={styles.modalButtonText}>Insert</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModal(false)}
      >
        <View style={styles.formatModal}>
          <View style={styles.formatModalContent}>
            <Text style={styles.formatModalTitle}>Delete Blog</Text>
            <Text style={[styles.formatOptionText, { textAlign: 'center', marginBottom: 20 }]}>
              Are you sure you want to delete "{blog.title}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={cancelDelete}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#EF4444' }]} 
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BlogEditorScreen;