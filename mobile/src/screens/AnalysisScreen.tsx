import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/apiService';
import CameraIcon from '../components/icons/CameraIcon';
import FolderIcon from '../components/icons/FolderIcon';
import SparkleIcon from '../components/icons/SparkleIcon';
import ChartIcon from '../components/icons/ChartIcon';
import VerifiedIcon from '../components/icons/VerifiedIcon';
import AnalysisAgreementModal from '../components/AnalysisAgreementModal';
import UpgradeDynamicIsland from '../components/UpgradeDynamicIsland';

const { width, height } = Dimensions.get('window');

const AnalysisScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, updateAnalysisAgreement, logout, refreshUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [libraryPermission, setLibraryPermission] = useState<boolean | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
  const pulseAnim = new Animated.Value(1);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    checkPermissions();
    checkAgreementStatus();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        })
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, [user]);

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll check permissions when user tries to use camera
      setCameraPermission(null);
      setLibraryPermission(true); // File picker doesn't need permission on web
    } else {
      const cameraResult = await Camera.getCameraPermissionsAsync();
      const libraryResult = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      setCameraPermission(cameraResult.status === 'granted');
      setLibraryPermission(libraryResult.status === 'granted');
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
        return true;
      } catch (error) {
        console.error('Web camera permission denied:', error);
        setCameraPermission(false);
        return false;
      }
    } else {
      const result = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(result.status === 'granted');
      return result.status === 'granted';
    }
  };

  const requestLibraryPermission = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setLibraryPermission(result.status === 'granted');
    return result.status === 'granted';
  };

  const checkAgreementStatus = () => {
    if (!user) return;
    
    // Show agreement modal if user hasn't accepted it yet
    const hasAcceptedAgreement = user.settings?.analysisAgreementAccepted === true;
    if (!hasAcceptedAgreement) {
      setShowAgreementModal(true);
    }
  };

  const checkUsageLimit = () => {
    if (!user) return { canAnalyze: false, reason: 'No user data' };

    const plan = user.subscription?.plan || 'free';
    const dailyAnalyses = user.apiUsage?.dailyAnalyses || 0;
    const monthlyAnalyses = user.apiUsage?.monthlyAnalyses || 0;

    const limits = {
      free: { daily: 1, monthly: 30 },
      premium: { daily: 5, monthly: 150 }
    };

    const planLimits = limits[plan as keyof typeof limits];
    if (!planLimits) return { canAnalyze: false, reason: 'Invalid plan' };

    if (dailyAnalyses >= planLimits.daily) {
      return { 
        canAnalyze: false, 
        reason: 'daily',
        message: `Daily limit reached (${dailyAnalyses}/${planLimits.daily}). ${plan === 'free' ? 'Upgrade to Premium for 5 analyses per day!' : 'Try again tomorrow.'}`,
        canUpgrade: plan === 'free'
      };
    }

    if (monthlyAnalyses >= planLimits.monthly) {
      return { 
        canAnalyze: false, 
        reason: 'monthly',
        message: `Monthly limit reached (${monthlyAnalyses}/${planLimits.monthly}). ${plan === 'free' ? 'Upgrade to Premium for 150 analyses per month!' : 'Your limit resets next month.'}`,
        canUpgrade: plan === 'free'
      };
    }

    return { canAnalyze: true };
  };

  const showUsageLimitAlert = (limitInfo: any) => {
    Alert.alert(
      'Usage Limit Reached',
      limitInfo.message,
      limitInfo.canUpgrade ? [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade to Premium', 
          onPress: () => navigation.navigate('PaymentSelection' as never)
        }
      ] : [{ text: 'OK' }]
    );
  };

  const getUsageStats = () => {
    if (!user) return { dailyUsed: 0, dailyLimit: 1, monthlyUsed: 0, monthlyLimit: 30, plan: 'free' };
    
    const plan = user.subscription?.plan || 'free';
    const limits = {
      free: { daily: 1, monthly: 30 },
      premium: { daily: 5, monthly: 150 }
    };
    
    const planLimits = limits[plan as keyof typeof limits] || limits.free;
    
    return {
      dailyUsed: user.apiUsage?.dailyAnalyses || 0,
      dailyLimit: planLimits.daily,
      monthlyUsed: user.apiUsage?.monthlyAnalyses || 0,
      monthlyLimit: planLimits.monthly,
      plan
    };
  };

  const handleAcceptAgreement = async () => {
    try {
      await updateAnalysisAgreement(true);
      setShowAgreementModal(false);
      addNotification({
        title: 'Agreement Accepted',
        message: 'You can now use the analysis features.',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Agreement acceptance error:', error);
      Alert.alert('Error', 'Failed to process agreement. Please try again.');
    }
  };

  const handleDeclineAgreement = async () => {
    try {
      await updateAnalysisAgreement(false);
    } catch (error: any) {
      // The updateAnalysisAgreement method will handle logout for declined agreements
      console.log('Agreement declined, user logged out');
    }
    setShowAgreementModal(false);
  };

  const takePhoto = async () => {
    // Check if user has accepted the analysis agreement
    if (!user?.settings?.analysisAgreementAccepted) {
      setShowAgreementModal(true);
      return;
    }

    // Check usage limits
    const limitCheck = checkUsageLimit();
    if (!limitCheck.canAnalyze) {
      showUsageLimitAlert(limitCheck);
      return;
    }

    try {
      let hasPermission = cameraPermission;
      
      if (!hasPermission) {
        hasPermission = await requestCameraPermission();
      }
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to take photos of trading charts.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImages([result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImages = async () => {
    // Check if user has accepted the analysis agreement
    if (!user?.settings?.analysisAgreementAccepted) {
      setShowAgreementModal(true);
      return;
    }

    // Check usage limits
    const limitCheck = checkUsageLimit();
    if (!limitCheck.canAnalyze) {
      showUsageLimitAlert(limitCheck);
      return;
    }

    try {
      let hasPermission = libraryPermission;
      
      if (!hasPermission) {
        hasPermission = await requestLibraryPermission();
      }
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Photo library access is needed to select chart images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, 5); // Max 5 images
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  const analyzeImages = async () => {
    // Check if user has accepted the analysis agreement
    if (!user?.settings?.analysisAgreementAccepted) {
      setShowAgreementModal(true);
      return;
    }

    // Check usage limits
    const limitCheck = checkUsageLimit();
    if (!limitCheck.canAnalyze) {
      showUsageLimitAlert(limitCheck);
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please select at least one image first.');
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = selectedImages.length === 1 
        ? await apiService.uploadImage(selectedImages[0], `chart_${Date.now()}.jpg`)
        : await apiService.uploadMultipleImages(selectedImages);

      console.log('Full API response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('Navigation to Result with:', response.data.analysis);
        
        // Refresh user data to update usage stats
        await refreshUser();
        
        addNotification({
          title: 'Analysis Complete!',
          message: `Chart analysis finished with ${response.data.analysis.signal.action} signal (${response.data.analysis.signal.confidence}% confidence)`,
          type: 'success'
        });
        
        navigation.navigate('Result' as never, { 
          analysis: response.data.analysis,
          metadata: response.data.metadata,
          imageUris: selectedImages
        } as never);
        
        setSelectedImages([]);
      } else {
        console.error('Analysis response not successful:', response.data);
        console.error('Full response:', JSON.stringify(response.data, null, 2));
        throw new Error(`Analysis failed: ${JSON.stringify(response.data)}`);
      }

    } catch (error: any) {
      console.error('Analysis error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Full error object:', JSON.stringify(error.response?.data, null, 2));
      
      let errorMessage = 'Analysis failed. Please try again.';
      
      if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait before analyzing more charts.';
      } else if (error.response?.status === 403 && error.response?.data?.error?.includes('Usage limit')) {
        // Handle server-side usage limit errors
        const limitInfo = checkUsageLimit();
        showUsageLimitAlert(limitInfo);
        return;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Analysis Failed', `${errorMessage}\n\nDetails: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
  };

  const usageStats = getUsageStats();
  const dailyProgress = (usageStats.dailyUsed / usageStats.dailyLimit) * 100;
  const monthlyProgress = (usageStats.monthlyUsed / usageStats.monthlyLimit) * 100;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    upgradeContainer: {
      marginBottom: 20,
      alignItems: 'center',
    },
    usageLimitsCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
      marginBottom: 32,
      borderWidth: 0,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    usageCardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    usageLimitsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    usageRow: {
      marginBottom: 12,
    },
    usageLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    usageProgressContainer: {
      height: 8,
      backgroundColor: theme.surface,
      borderRadius: 4,
      overflow: 'hidden',
    },
    usageProgress: {
      height: '100%',
      borderRadius: 4,
    },
    planBadge: {
      backgroundColor: theme.primary + '20',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'center',
      marginTop: 8,
    },
    planBadgeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    planBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
      textTransform: 'uppercase',
    },
    uploadSection: {
      marginBottom: 32,
    },
    uploadButtons: {
      gap: 16,
      marginBottom: 24,
    },
    uploadButton: {
      borderRadius: 28,
      padding: 32,
      alignItems: 'center',
      backgroundColor: theme.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border + '40',
    },
    uploadButtonGlow: {
      position: 'absolute',
      top: -50,
      left: -50,
      right: -50,
      bottom: -50,
      opacity: 0.1,
    },
    uploadIcon: {
      width: 72,
      height: 72,
      marginBottom: 20,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
    },
    uploadTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    uploadDescription: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500',
      maxWidth: 280,
    },
    imagesSection: {
      marginBottom: 24,
    },
    imagesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    imagesTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    clearAllText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '500',
    },
    imagesScroll: {
      marginBottom: 20,
    },
    imageItem: {
      marginRight: 12,
      position: 'relative',
    },
    thumbnailImage: {
      width: 120,
      height: 120,
      borderRadius: 12,
      backgroundColor: theme.surface,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FF4444',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    removeImageText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 20,
    },
    imageNumber: {
      position: 'absolute',
      bottom: 4,
      left: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    addMoreButton: {
      width: 120,
      height: 120,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addMoreText: {
      fontSize: 32,
      color: theme.textSecondary,
    },
    analyzeButton: {
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
      marginVertical: 8,
    },
    analyzeButtonDisabled: {
      shadowOpacity: 0,
      elevation: 0,
    },
    analyzeButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      zIndex: 1,
      letterSpacing: 0.5,
    },
    tips: {
      marginBottom: 32,
    },
    tipsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    tipBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.primary,
      marginTop: 8,
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    usage: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    usageTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    usageText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    loadingContent: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      marginHorizontal: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    loadingTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    loadingSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Chart Analysis</Text>
        <Text style={styles.subtitle}>AI-powered trading insights</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Show upgrade button for free users */}
        {usageStats.plan === 'free' && (
          <View style={styles.upgradeContainer}>
            <UpgradeDynamicIsland />
          </View>
        )}

        {/* Usage Limits Card */}
        <View style={styles.usageLimitsCard}>
          <LinearGradient
            colors={['#00D4FF', '#764ba2']}
            style={styles.usageCardGradient}
          />
          <Text style={styles.usageLimitsTitle}>Usage Limits</Text>
          
          <View style={styles.usageRow}>
            <View style={styles.usageLabel}>
              <Text style={styles.usageLabel}>Daily Analyses</Text>
              <Text style={styles.usageLabel}>{usageStats.dailyUsed}/{usageStats.dailyLimit}</Text>
            </View>
            <View style={styles.usageProgressContainer}>
              <LinearGradient
                colors={dailyProgress >= 100 ? ['#FF4444', '#CC0000'] : ['#00D4FF', '#0099CC']}
                style={[styles.usageProgress, { width: `${Math.min(dailyProgress, 100)}%` }]}
              />
            </View>
          </View>

          <View style={styles.usageRow}>
            <View style={styles.usageLabel}>
              <Text style={styles.usageLabel}>Monthly Analyses</Text>
              <Text style={styles.usageLabel}>{usageStats.monthlyUsed}/{usageStats.monthlyLimit}</Text>
            </View>
            <View style={styles.usageProgressContainer}>
              <LinearGradient
                colors={monthlyProgress >= 100 ? ['#FF4444', '#CC0000'] : ['#4CAF50', '#388E3C']}
                style={[styles.usageProgress, { width: `${Math.min(monthlyProgress, 100)}%` }]}
              />
            </View>
          </View>

          <View style={styles.planBadge}>
            <View style={styles.planBadgeContent}>
              <Text style={styles.planBadgeText}>{usageStats.plan} Plan</Text>
              {usageStats.plan === 'premium' && (
                <VerifiedIcon size={14} color="#00D4FF" />
              )}
            </View>
          </View>
        </View>

        {selectedImages.length === 0 ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadButtons}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={takePhoto}
                  disabled={isAnalyzing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#00D4FF40', '#764ba240']}
                    style={styles.uploadButtonGlow}
                  />
                  <LinearGradient
                    colors={['#00D4FF', '#0099CC']}
                    style={styles.uploadIcon}
                  >
                    <CameraIcon size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.uploadTitle}>Take Photo</Text>
                  <Text style={styles.uploadDescription}>
                    Capture charts directly with your camera for instant analysis
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImages}
                disabled={isAnalyzing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4CAF5040', '#388E3C40']}
                  style={styles.uploadButtonGlow}
                />
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  style={styles.uploadIcon}
                >
                  <FolderIcon size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.uploadTitle}>Multi-Chart Analysis</Text>
                <Text style={styles.uploadDescription}>
                  Upload multiple timeframes for comprehensive market insights
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imagesSection}>
            <View style={styles.imagesHeader}>
              <Text style={styles.imagesTitle}>
                {selectedImages.length} Chart{selectedImages.length > 1 ? 's' : ''} Selected
              </Text>
              <TouchableOpacity onPress={clearAllImages} disabled={isAnalyzing}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri }} style={styles.thumbnailImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    disabled={isAnalyzing}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageNumber}>{index + 1}</Text>
                </View>
              ))}
              
              {selectedImages.length < 5 && (
                <TouchableOpacity 
                  style={styles.addMoreButton}
                  onPress={pickImages}
                  disabled={isAnalyzing}
                >
                  <Text style={styles.addMoreText}>+</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={analyzeImages}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={isAnalyzing ? [theme.textSecondary, theme.textSecondary] : ['#00D4FF', '#764ba2']}
                style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
              />
              {isAnalyzing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SparkleIcon size={20} color="#FFFFFF" />
                  <Text style={styles.analyzeButtonText}>
                    Analyze {selectedImages.length > 1 ? 'Multi-Timeframe' : 'Chart'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for Better Analysis</Text>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Ensure charts are clear and well-lit with visible price action
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Include timeframe information and symbol if possible
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Technical indicators and volume data improve accuracy
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Avoid blurry or cropped charts for optimal results
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Upload multiple timeframes (1m, 5m, 1h, 4h, 1d) for better analysis
            </Text>
          </View>
        </View>
      </ScrollView>

      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingTitle}>Analyzing Chart</Text>
            <Text style={styles.loadingSubtitle}>
              Our AI is processing your chart and gathering market data...
            </Text>
          </View>
        </View>
      )}

      <AnalysisAgreementModal
        visible={showAgreementModal}
        onAccept={handleAcceptAgreement}
        onDecline={handleDeclineAgreement}
      />
      </View>
    </View>
  );
};

export default AnalysisScreen;