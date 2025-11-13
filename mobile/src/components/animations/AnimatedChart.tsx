import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const AnimatedChart: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    };

    animate();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { rotate }],
        },
      ]}
    >
      <Svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background Circle */}
        <Circle
          cx="100"
          cy="100"
          r="90"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
        />
        
        {/* Chart Lines */}
        <Path
          d="M 40 140 Q 60 120 80 130 T 120 110 T 160 120"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        <Path
          d="M 40 160 Q 70 140 100 150 T 160 140"
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Data Points */}
        <Circle cx="80" cy="130" r="4" fill="#FFFFFF" />
        <Circle cx="120" cy="110" r="4" fill="#FFFFFF" />
        <Circle cx="160" cy="120" r="4" fill="#FFFFFF" />
        
        {/* Grid Lines */}
        <Line x1="40" y1="80" x2="160" y2="80" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <Line x1="40" y1="100" x2="160" y2="100" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <Line x1="40" y1="120" x2="160" y2="120" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <Line x1="40" y1="140" x2="160" y2="140" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        
        {/* AI Signal Indicator */}
        <Circle cx="140" cy="90" r="8" fill="#00FF88" opacity="0.8" />
        <Circle cx="140" cy="90" r="4" fill="#FFFFFF" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedChart;