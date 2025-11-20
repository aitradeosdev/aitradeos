import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';

const AdminPopupMessagesScreen: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customization, setCustomization] = useState({
    backgroundColor: '#1A1A1A',
    titleColor: '#FFFFFF',
    messageColor: '#CCCCCC',
    buttonText: 'Got it!',
    buttonColor: '#00D4FF',
    buttonTextColor: '#FFFFFF',
    borderRadius: 20,
    link: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await apiService.get('/popup-messages/admin/all');
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createMessage = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/popup-messages/admin/create', { title, message, customization });
      setTitle('');
      setMessage('');
      setCustomization({
        backgroundColor: '#1A1A1A',
        titleColor: '#FFFFFF',
        messageColor: '#CCCCCC',
        buttonText: 'Got it!',
        buttonColor: '#00D4FF',
        buttonTextColor: '#FFFFFF',
        borderRadius: 20,
        link: ''
      });
      fetchMessages();
      setSuccessMessage('Message created successfully');
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create message');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await apiService.delete(`/popup-messages/admin/${deleteId}`);
      fetchMessages();
      setSuccessMessage('Message deleted successfully');
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete message');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await apiService.patch(`/popup-messages/admin/${id}/toggle`);
      fetchMessages();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle message status');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 14,
      color: theme.text,
      fontSize: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    createButton: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    createButtonGradient: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    messageCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    messageTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    messageText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    messageFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.surface,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    deleteButton: {
      backgroundColor: '#FF4444',
    },
    deleteButtonText: {
      color: '#FFFFFF',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    colorInput: {
      flex: 1,
    },
    label: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    colorPickerRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    previewContainer: {
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    previewHeader: {
      height: 4,
      backgroundColor: '#00D4FF',
      marginBottom: 20,
      borderRadius: 2,
    },
    previewContent: {
      marginBottom: 20,
    },
    previewTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 12,
    },
    previewMessage: {
      fontSize: 15,
      lineHeight: 22,
    },
    previewButton: {
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 12,
    },
    previewButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    previewLink: {
      color: '#00D4FF',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popup Messages</Text>
        <Text style={styles.subtitle}>Send announcements to all users</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Message Title"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Message Content"
            placeholderTextColor={theme.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          
          <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: 16 }]}>Customization</Text>
          <View style={styles.row}>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Background</Text>
              <View style={styles.colorPickerRow}>
                <input
                  type="color"
                  value={customization.backgroundColor}
                  onChange={(e: any) => setCustomization({...customization, backgroundColor: e.target.value})}
                  style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="#1A1A1A"
                  placeholderTextColor={theme.textSecondary}
                  value={customization.backgroundColor}
                  onChangeText={(text) => setCustomization({...customization, backgroundColor: text})}
                />
              </View>
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Title Color</Text>
              <View style={styles.colorPickerRow}>
                <input
                  type="color"
                  value={customization.titleColor}
                  onChange={(e: any) => setCustomization({...customization, titleColor: e.target.value})}
                  style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="#FFFFFF"
                  placeholderTextColor={theme.textSecondary}
                  value={customization.titleColor}
                  onChangeText={(text) => setCustomization({...customization, titleColor: text})}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Message Color</Text>
              <View style={styles.colorPickerRow}>
                <input
                  type="color"
                  value={customization.messageColor}
                  onChange={(e: any) => setCustomization({...customization, messageColor: e.target.value})}
                  style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="#CCCCCC"
                  placeholderTextColor={theme.textSecondary}
                  value={customization.messageColor}
                  onChangeText={(text) => setCustomization({...customization, messageColor: text})}
                />
              </View>
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Button Color</Text>
              <View style={styles.colorPickerRow}>
                <input
                  type="color"
                  value={customization.buttonColor}
                  onChange={(e: any) => setCustomization({...customization, buttonColor: e.target.value})}
                  style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="#00D4FF"
                  placeholderTextColor={theme.textSecondary}
                  value={customization.buttonColor}
                  onChangeText={(text) => setCustomization({...customization, buttonColor: text})}
                />
              </View>
            </View>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Button Text (e.g., Got it!)"
            placeholderTextColor={theme.textSecondary}
            value={customization.buttonText}
            onChangeText={(text) => setCustomization({...customization, buttonText: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Link URL (optional - button will open this link)"
            placeholderTextColor={theme.textSecondary}
            value={customization.link}
            onChangeText={(text) => setCustomization({...customization, link: text})}
          />
          
          <TouchableOpacity style={styles.createButton} onPress={createMessage} disabled={loading}>
            <LinearGradient colors={['#00D4FF', '#764ba2']} style={styles.createButtonGradient}>
              <Text style={styles.createButtonText}>{loading ? 'Creating...' : 'Create Message'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Preview</Text>
          <View style={[styles.previewContainer, { backgroundColor: customization.backgroundColor, borderRadius: customization.borderRadius }]}>
            <View style={styles.previewHeader} />
            <View style={styles.previewContent}>
              <Text style={[styles.previewTitle, { color: customization.titleColor }]}>
                {title || 'Message Title'}
              </Text>
              <Text style={[styles.previewMessage, { color: customization.messageColor }]}>
                {message || 'Your message content will appear here...'}
              </Text>
            </View>
            <View style={[styles.previewButton, { backgroundColor: customization.buttonColor, borderRadius: 12 }]}>
              <Text style={[styles.previewButtonText, { color: customization.buttonTextColor }]}>
                {customization.buttonText}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Messages</Text>
          {messages.map((msg) => (
            <View key={msg._id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageTitle}>{msg.title}</Text>
              </View>
              <Text style={styles.messageText}>{msg.message}</Text>
              <View style={styles.messageFooter}>
                <View style={[styles.statusBadge, { backgroundColor: msg.isActive ? '#4CAF50' : '#666666' }]}>
                  <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                    {msg.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => toggleActive(msg._id)}>
                    <Text style={styles.actionButtonText}>{msg.isActive ? 'Deactivate' : 'Activate'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteMessage(msg._id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        danger
      />

      <SuccessModal
        visible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </View>
  );
};

export default AdminPopupMessagesScreen;
