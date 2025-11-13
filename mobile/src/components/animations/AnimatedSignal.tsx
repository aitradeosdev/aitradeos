import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

const AnimatedSignal: React.FC = () => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const wave1 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360],
  });

  const wave2 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 480],
  });

  const wave3 = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [240, 600],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Svg width="80" height="80" viewBox="0 0 80 80">
        {/* Signal Waves */}
        <G>
          <Animated.View style={{ transform: [{ rotate: `${wave1}deg` }] }}>
            <Circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="#00FF88"
              strokeWidth="2"
              strokeDasharray="3,6"
              opacity="0.8"
            />
          </Animated.View>
          
          <Animated.View style={{ transform: [{ rotate: `${wave2}deg` }] }}>
            <Circle
              cx="40"
              cy="40"
              r="22"
              fill="none"
              stroke="#00FF88"
              strokeWidth="2"
              strokeDasharray="2,4"
              opacity="0.6"
            />
          </Animated.View>
          
          <Animated.View style={{ transform: [{ rotate: `${wave3}deg` }] }}>
            <Circle
              cx="40"
              cy="40"
              r="14"
              fill="none"
              stroke="#00FF88"
              strokeWidth="2"
              strokeDasharray="1,2"
              opacity="0.4"
            />
          </Animated.View>
        </G>
        
        {/* Central Signal Point */}
        <Circle cx="40" cy="40" r="6" fill="#00FF88" />
        <Circle cx="40" cy="40" r="3" fill="#FFFFFF" />
        
        {/* Signal Indicators */}
        <Path d="M 40 20 L 45 15 L 35 15 Z" fill="#00FF88" />
        <Path d="M 60 40 L 65 35 L 65 45 Z" fill="#FFD700" />
        <Path d="M 40 60 L 35 65 L 45 65 Z" fill="#FF4444" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AnimatedSignal;