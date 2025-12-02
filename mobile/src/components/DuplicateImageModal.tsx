import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface DuplicateImageModalProps {
  visible: boolean;
  onClose: () => void;
  onViewHistory: () => void;
  analysisDate: string;
  signal: {
    action: string;
    confidence: number;
  };
}

const DuplicateImageModal: React.FC<DuplicateImageModalProps> = ({
  visible,
  onClose,
  onViewHistory,
  analysisDate,
  signal
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
      textAlign: 'center',
    },
    signalInfo: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    signalText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    viewButton: {
      backgroundColor: theme.primary,
    },
    cancelText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    viewText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Image Already Analyzed</Text>
          
          <Text style={styles.message}>
            This chart was analyzed on {analysisDate}
          </Text>

          <View style={styles.signalInfo}>
            <Text style={styles.signalText}>
              {signal.action} Signal • {signal.confidence}% Confidence
            </Text>
          </View>

          <Text style={[styles.message, { marginBottom: 24 }]}>
            Would you like to view your analysis history?
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.viewButton]}
              onPress={onViewHistory}
            >
              <Text style={styles.viewText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DuplicateImageModal;