import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import WarningIcon from './icons/WarningIcon';

interface DeprecationBannerProps {
  message: string;
}

const DeprecationBanner: React.FC<DeprecationBannerProps> = ({ message }) => {
  const [scrollX] = useState(new Animated.Value(0));

  useEffect(() => {
    scrollX.setValue(0);
    const scrollAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -2000,
          duration: 30000,
          useNativeDriver: true,
          easing: (t) => t,
        }),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ])
    );
    scrollAnimation.start();
    return () => scrollAnimation.stop();
  }, [message]);

  return (
    <View style={styles.deprecationBanner}>
      <Animated.View style={[styles.deprecationScroll, { transform: [{ translateX: scrollX }] }]}>
        <View style={styles.deprecationItem}>
          <WarningIcon size={16} color="#FFFFFF" />
          <Text style={styles.deprecationText}>{message}</Text>
        </View>
        <View style={styles.deprecationItem}>
          <WarningIcon size={16} color="#FFFFFF" />
          <Text style={styles.deprecationText}>{message}</Text>
        </View>
        <View style={styles.deprecationItem}>
          <WarningIcon size={16} color="#FFFFFF" />
          <Text style={styles.deprecationText}>{message}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  deprecationBanner: {
    backgroundColor: '#FF6B00',
    overflow: 'hidden',
    height: 36,
    justifyContent: 'center',
  },
  deprecationScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  deprecationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deprecationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    whiteSpace: 'nowrap',
  },
});

export default DeprecationBanner;
