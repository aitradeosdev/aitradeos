import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

const LogoSlider: React.FC = () => {
  const [logos, setLogos] = useState<any[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollX2 = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await apiService.get('/admin/logos');
      setLogos(response.data.logos);
    } catch (error) {
      console.error('Failed to fetch logos:', error);
    }
  };

  useEffect(() => {
    if (logos.length === 0) return;

    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -2400,
        duration: 35000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(scrollX2, {
        toValue: -2400,
        duration: 35000,
        useNativeDriver: true,
      })
    ).start();
  }, [logos]);

  if (logos.length === 0) return null;

  const getImageUrl = (imageUrl: string) => {
    const baseUrl = apiService.getApiUrl().replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  };

  const renderLogos = () => logos.map((logo, index) => (
    <View key={`${logo._id}-${index}`} style={styles.logoItem}>
      <Image 
        source={{ uri: getImageUrl(logo.imageUrl) }} 
        style={styles.logoImage}
        onError={(e) => console.log('Logo load error:', e.nativeEvent.error)}
      />
    </View>
  ));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POWERED BY</Text>
      <View style={styles.sliderContainer}>
        <Animated.View style={[styles.slider, { transform: [{ translateX: scrollX }] }]}>
          {renderLogos()}
          {renderLogos()}
        </Animated.View>
        <Animated.View style={[styles.slider, { transform: [{ translateX: scrollX2 }], left: 2400 }]}>
          {renderLogos()}
          {renderLogos()}
        </Animated.View>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  sliderContainer: {
    height: 80,
    position: 'relative',
    width: '100%',
  },
  slider: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
  },
  logoItem: {
    marginHorizontal: 80,
    opacity: 0.6,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
  },
});

export default LogoSlider;
