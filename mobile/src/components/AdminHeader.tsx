import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAdmin } from '../contexts/AdminContext';
import { useBlog } from '../contexts/BlogContext';
import MegaphoneIcon from './icons/MegaphoneIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import GearIcon from './icons/GearIcon';
import DotsVerticalIcon from './icons/DotsVerticalIcon';
import PhoneIcon from './icons/PhoneIcon';
import ImageIcon from './icons/ImageIcon';
import DocumentIcon from './icons/DocumentIcon';
import WrenchIcon from './icons/WrenchIcon';
import SwitchIcon from './icons/SwitchIcon';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { setAdminMode } = useAdmin();
  const { setBlogMode } = useBlog();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleExitAdmin = async () => {
    await setAdminMode(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleBlogMode = async () => {
    await setBlogMode(true);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      paddingTop: Platform.OS === 'web' ? 20 : 50,
      paddingBottom: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    titleSection: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
      position: 'absolute',
      top: Platform.OS === 'web' ? 70 : 100,
      right: 20,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuIconContainer: {
      marginRight: 12,
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: {
      fontSize: 15,
      color: theme.text,
      fontWeight: '500',
    },
    exitText: {
      color: '#10B981',
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('AdminPopupMessages' as never)}
            >
              <MegaphoneIcon size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('AdminPaymentConfig' as never)}
            >
              <CreditCardIcon size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('SiteConfigScreen' as never)}
            >
              <GearIcon size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setMenuVisible(true)}
            >
              <DotsVerticalIcon size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AdminContactConfig' as never);
              }}
            >
              <View style={styles.menuIconContainer}>
                <PhoneIcon size={18} color={theme.text} />
              </View>
              <Text style={styles.menuText}>Contact Config</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AdminLogos' as never);
              }}
            >
              <View style={styles.menuIconContainer}>
                <ImageIcon size={18} color={theme.text} />
              </View>
              <Text style={styles.menuText}>Manage Logos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleBlogMode();
              }}
            >
              <View style={styles.menuIconContainer}>
                <DocumentIcon size={18} color={theme.text} />
              </View>
              <Text style={styles.menuText}>Blog Manager</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => {
                setMenuVisible(false);
                handleExitAdmin();
              }}
            >
              <View style={styles.menuIconContainer}>
                <SwitchIcon size={18} color="#10B981" />
              </View>
              <Text style={[styles.menuText, styles.exitText]}>Switch to User App</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default AdminHeader;
