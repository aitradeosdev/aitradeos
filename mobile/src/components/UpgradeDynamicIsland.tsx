import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import StarIcon from './icons/StarIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

const { width } = Dimensions.get('window');

interface UpgradeDynamicIslandProps {
  onPress?: () => void;
}

const UpgradeDynamicIsland: React.FC<UpgradeDynamicIslandProps> = ({ onPress }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(1));
  const [opacityValue] = useState(new Animated.Value(1));

  // Don't show for premium users
  if (!user || user.subscription?.plan === 'premium') {
    return null;
  }

  useEffect(() => {
    // Auto-collapse after 3 seconds when expanded
    if (isExpanded) {
      const timer = setTimeout(() => {
        handleCollapse();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8
      }),
      Animated.spring(scaleValue, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      })
    ]).start();
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      })
    ]).start();
  };

  const handlePress = () => {
    if (!isExpanded) {
      handleExpand();
    } else {
      // Navigate to payment screen
      if (onPress) {
        onPress();
      } else {
        navigation.navigate('PaymentSelection' as never);
      }
      
      // Animate press feedback
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 200]
  });

  const animatedHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 48]
  });

  const textOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.island,
            {
              width: animatedWidth,
              height: animatedHeight,
            }
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {!isExpanded ? (
              // Collapsed state - just the star icon and "Premium"
              <View style={styles.collapsedContent}>
                <View style={styles.starContainer}>
                  <StarIcon size={16} color="#FFFFFF" animated={true} />
                </View>
                <Text style={styles.collapsedText}>Premium</Text>
              </View>
            ) : (
              // Expanded state - full text
              <Animated.View
                style={[
                  styles.expandedContent,
                  { opacity: textOpacity }
                ]}
              >
                <View style={styles.expandedLeft}>
                  <StarIcon size={16} color="#FFFFFF" animated={true} />
                  <Text style={styles.expandedText}>Upgrade to Premium</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <ArrowRightIcon size={14} color="#FFFFFF" />
                </View>
              </Animated.View>
            )}
          </LinearGradient>
          
          {/* Subtle glow effect */}
          <View style={styles.glowContainer}>
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
              style={styles.glow}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  touchable: {
    borderRadius: 22,
    overflow: 'visible',
  },
  island: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starContainer: {
    marginRight: 6,
  },

  collapsedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  expandedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  expandedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  arrowContainer: {
    marginLeft: 8,
  },

  glowContainer: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    zIndex: -1,
  },
  glow: {
    flex: 1,
    borderRadius: 24,
    opacity: 0.5,
  },
});

export default UpgradeDynamicIsland;