import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface PopupMessageModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  customization?: {
    backgroundColor?: string;
    titleColor?: string;
    messageColor?: string;
    buttonText?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    borderRadius?: number;
    link?: string;
  };
}

const PopupMessageModal: React.FC<PopupMessageModalProps> = ({ visible, title, message, onClose, customization }) => {
  const { theme } = useTheme();
  const custom = customization || {};

  const handleButtonPress = () => {
    if (custom.link) {
      Linking.openURL(custom.link);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { 
          backgroundColor: custom.backgroundColor || theme.card,
          borderRadius: custom.borderRadius || 20
        }]}>
          <LinearGradient colors={['#00D4FF', '#764ba2']} style={styles.header} />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <View style={styles.content}>
            <Text style={[styles.title, { color: custom.titleColor || theme.text }]}>{title}</Text>
            <Text style={[styles.message, { color: custom.messageColor || theme.textSecondary }]}>{message}</Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
            <View style={[styles.buttonGradient, { backgroundColor: custom.buttonColor || '#00D4FF' }]}>
              <Text style={[styles.buttonText, { color: custom.buttonTextColor || '#FFFFFF' }]}>
                {custom.buttonText || 'Got it!'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    height: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PopupMessageModal;
