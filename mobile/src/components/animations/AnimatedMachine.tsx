import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface AnimatedMachineProps {
  isActive: boolean;
}

const AnimatedMachine: React.FC<AnimatedMachineProps> = ({ isActive }) => {
  const flickerAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flickerAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(flickerAnim, {
            toValue: 0.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(flickerAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      flickerAnim.setValue(0.5);
      rotateAnim.setValue(0);
    }
  }, [isActive]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ rotate }] }]}>
      <Svg width="200" height="200" viewBox="0 0 200 200">
        {/* Outer Ring */}
        <Circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#00B2FF"
          strokeWidth="2"
          strokeDasharray="10,5"
          opacity="0.6"
        />
        
        {/* Middle Ring */}
        <Circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#FF5858"
          strokeWidth="2"
          strokeDasharray="8,4"
          opacity="0.5"
        />
        
        {/* Inner Ring */}
        <Circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke="#00FF88"
          strokeWidth="2"
          strokeDasharray="6,3"
          opacity="0.4"
        />
        
        {/* Center Core */}
        <Animated.View style={{ opacity: flickerAnim }}>
          <Circle cx="100" cy="100" r="20" fill="rgba(0, 178, 255, 0.3)" />
          <Circle cx="100" cy="100" r="10" fill="#00B2FF" />
        </Animated.View>
        
        {/* Machine Lights */}
        <G>
          <Circle cx="100" cy="50" r="5" fill="#00FF88" opacity="0.8" />
          <Circle cx="150" cy="100" r="5" fill="#FF5858" opacity="0.8" />
          <Circle cx="100" cy="150" r="5" fill="#FFD700" opacity="0.8" />
          <Circle cx="50" cy="100" r="5" fill="#00B2FF" opacity="0.8" />
        </G>
        
        {/* Connection Lines */}
        <Path d="M 100 70 L 100 50" stroke="#00FF88" strokeWidth="2" opacity="0.6" />
        <Path d="M 130 100 L 150 100" stroke="#FF5858" strokeWidth="2" opacity="0.6" />
        <Path d="M 100 130 L 100 150" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
        <Path d="M 70 100 L 50 100" stroke="#00B2FF" strokeWidth="2" opacity="0.6" />
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

export default AnimatedMachine;