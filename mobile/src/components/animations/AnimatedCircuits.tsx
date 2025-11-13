import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface AnimatedCircuitsProps {
  side: 'left' | 'right';
}

const AnimatedCircuits: React.FC<AnimatedCircuitsProps> = ({ side }) => {
  const isLeft = side === 'left';
  
  return (
    <View style={[styles.container, isLeft ? styles.left : styles.right]}>
      <Svg width="200" height="400" viewBox="0 0 200 400">
        {/* Circuit Lines */}
        <Path
          d="M 20 50 L 80 50 L 80 120 L 150 120"
          fill="none"
          stroke={isLeft ? "#00B2FF" : "#FF5858"}
          strokeWidth="2"
          opacity="0.6"
        />
        
        <Path
          d="M 10 100 L 60 100 L 60 180 L 120 180 L 120 250"
          fill="none"
          stroke={isLeft ? "#00B2FF" : "#FF5858"}
          strokeWidth="2"
          opacity="0.4"
        />
        
        <Path
          d="M 40 200 L 100 200 L 100 280 L 160 280"
          fill="none"
          stroke={isLeft ? "#00B2FF" : "#FF5858"}
          strokeWidth="2"
          opacity="0.5"
        />
        
        {/* Circuit Nodes */}
        <Circle cx="80" cy="50" r="4" fill={isLeft ? "#00B2FF" : "#FF5858"} opacity="0.8" />
        <Circle cx="80" cy="120" r="4" fill={isLeft ? "#00B2FF" : "#FF5858"} opacity="0.8" />
        <Circle cx="60" cy="100" r="4" fill={isLeft ? "#00B2FF" : "#FF5858"} opacity="0.8" />
        <Circle cx="120" cy="180" r="4" fill={isLeft ? "#00B2FF" : "#FF5858"} opacity="0.8" />
        <Circle cx="100" cy="200" r="4" fill={isLeft ? "#00B2FF" : "#FF5858"} opacity="0.8" />
        
        {/* Additional Details */}
        <Line x1="20" y1="80" x2="40" y2="80" stroke={isLeft ? "#00B2FF" : "#FF5858"} strokeWidth="1" opacity="0.3" />
        <Line x1="60" y1="150" x2="80" y2="150" stroke={isLeft ? "#00B2FF" : "#FF5858"} strokeWidth="1" opacity="0.3" />
        <Line x1="100" y1="220" x2="120" y2="220" stroke={isLeft ? "#00B2FF" : "#FF5858"} strokeWidth="1" opacity="0.3" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: 200,
    height: '100%',
    zIndex: 1,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
});

export default AnimatedCircuits;