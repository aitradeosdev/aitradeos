import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

const AnimatedAI: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ),
    ]).start();
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
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Svg width="80" height="80" viewBox="0 0 80 80">
        {/* Outer Ring */}
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#667eea"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </Animated.View>
        
        {/* AI Brain */}
        <G>
          <Circle cx="40" cy="40" r="25" fill="rgba(102, 126, 234, 0.2)" />
          
          {/* Neural Network Nodes */}
          <Circle cx="30" cy="30" r="3" fill="#667eea" />
          <Circle cx="50" cy="30" r="3" fill="#667eea" />
          <Circle cx="25" cy="45" r="3" fill="#667eea" />
          <Circle cx="40" cy="45" r="3" fill="#667eea" />
          <Circle cx="55" cy="45" r="3" fill="#667eea" />
          <Circle cx="35" cy="55" r="3" fill="#667eea" />
          <Circle cx="45" cy="55" r="3" fill="#667eea" />
          
          {/* Neural Connections */}
          <Path d="M 30 30 L 25 45" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 30 30 L 40 45" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 50 30 L 40 45" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 50 30 L 55 45" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 25 45 L 35 55" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 40 45 L 35 55" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 40 45 L 45 55" stroke="#667eea" strokeWidth="1" opacity="0.6" />
          <Path d="M 55 45 L 45 55" stroke="#667eea" strokeWidth="1" opacity="0.6" />
        </G>
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

export default AnimatedAI;