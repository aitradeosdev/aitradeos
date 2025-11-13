import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import EmailIcon from './icons/EmailIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import PhoneIcon from './icons/PhoneIcon';

interface ContactOption {
  address?: string;
  number?: string;
  label: string;
}

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  contacts: {
    email: ContactOption | null;
    whatsapp: ContactOption | null;
    phone: ContactOption | null;
  };
}

const ContactModal: React.FC<ContactModalProps> = ({ visible, onClose, contacts }) => {
  const { theme } = useTheme();

  const handleEmailPress = (email: string) => {
    const subject = 'Payment Support - Huntr AI';
    const body = 'Hello, I need assistance with my payment.';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Email app not available');
      }
    });
  };

  const handleWhatsAppPress = (number: string) => {
    const message = 'Hello, I need assistance with my payment on Huntr AI.';
    // Remove all non-digit characters except +
    let cleanNumber = number.replace(/[^\d+]/g, '');
    
    // Remove + if present at the beginning
    if (cleanNumber.startsWith('+')) {
      cleanNumber = cleanNumber.substring(1);
    }
    
    // Ensure we have a valid number
    if (!cleanNumber || cleanNumber.length < 10) {
      Alert.alert('Error', 'Invalid WhatsApp number configured');
      return;
    }
    
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure WhatsApp is installed.');
    });
  };

  const handlePhonePress = (number: string) => {
    const url = `tel:${number}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone app not available');
      }
    });
  };

  const hasContacts = contacts.email || contacts.whatsapp || contacts.phone;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Contact Support</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Choose how you'd like to contact us
            </Text>
          </View>

          <View style={styles.contactOptions}>
            {!hasContacts && (
              <View style={styles.noContactsContainer}>
                <Text style={[styles.noContactsText, { color: theme.textSecondary }]}>
                  Contact information not available at the moment.
                </Text>
              </View>
            )}

            {contacts.email && (
              <TouchableOpacity
                style={[styles.contactOption, { borderColor: theme.border }]}
                onPress={() => handleEmailPress(contacts.email!.address!)}
              >
                <View style={styles.contactIconContainer}>
                  <EmailIcon size={24} color={theme.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.text }]}>
                    {contacts.email.label}
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.textSecondary }]}>
                    {contacts.email.address}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contacts.whatsapp && (
              <TouchableOpacity
                style={[styles.contactOption, { borderColor: theme.border }]}
                onPress={() => handleWhatsAppPress(contacts.whatsapp!.number!)}
              >
                <View style={styles.contactIconContainer}>
                  <WhatsAppIcon size={24} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.text }]}>
                    {contacts.whatsapp.label}
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.textSecondary }]}>
                    {contacts.whatsapp.number}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contacts.phone && (
              <TouchableOpacity
                style={[styles.contactOption, { borderColor: theme.border }]}
                onPress={() => handlePhonePress(contacts.phone!.number!)}
              >
                <View style={styles.contactIconContainer}>
                  <PhoneIcon size={24} color={theme.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.text }]}>
                    {contacts.phone.label}
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.textSecondary }]}>
                    {contacts.phone.number}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactOptions: {
    gap: 12,
    marginBottom: 24,
  },
  noContactsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noContactsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
  },
  closeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactModal;