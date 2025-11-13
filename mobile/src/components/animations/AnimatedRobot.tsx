import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const AnimatedRobot: React.FC = () => {
  const hueAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(hueAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  return (
    <Animated.View style={styles.container}>
      <Svg width="200" height="300" viewBox="0 0 200 300">
        {/* Robot Body */}
        <Rect x="60" y="120" width="80" height="120" rx="10" fill="#333" stroke="#00B2FF" strokeWidth="2" />
        
        {/* Robot Head */}
        <Rect x="70" y="60" width="60" height="70" rx="15" fill="#444" stroke="#00B2FF" strokeWidth="2" />
        
        {/* Eyes */}
        <Circle cx="85" cy="85" r="8" fill="#00B2FF" opacity="0.8" />
        <Circle cx="115" cy="85" r="8" fill="#00B2FF" opacity="0.8" />
        <Circle cx="85" cy="85" r="4" fill="#FFFFFF" />
        <Circle cx="115" cy="85" r="4" fill="#FFFFFF" />
        
        {/* Mouth */}
        <Rect x="90" y="105" width="20" height="8" rx="4" fill="#FF5858" />
        
        {/* Arms */}
        <Rect x="30" y="130" width="25" height="60" rx="12" fill="#333" stroke="#00B2FF" strokeWidth="2" />
        <Rect x="145" y="130" width="25" height="60" rx="12" fill="#333" stroke="#00B2FF" strokeWidth="2" />
        
        {/* Legs */}
        <Rect x="70" y="245" width="20" height="50" rx="10" fill="#333" stroke="#00B2FF" strokeWidth="2" />
        <Rect x="110" y="245" width="20" height="50" rx="10" fill="#333" stroke="#00B2FF" strokeWidth="2" />
        
        {/* Chest Panel */}
        <Rect x="75" y="140" width="50" height="40" rx="5" fill="#222" stroke="#00B2FF" strokeWidth="1" />
        <Circle cx="90" cy="155" r="3" fill="#00FF88" />
        <Circle cx="110" cy="155" r="3" fill="#FF5858" />
        <Rect x="85" y="165" width="30" height="8" rx="4" fill="#00B2FF" opacity="0.6" />
        
        {/* Antenna */}
        <Path d="M 100 60 L 100 40" stroke="#00B2FF" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="100" cy="35" r="5" fill="#FF5858" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedRobot;