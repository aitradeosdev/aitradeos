import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CreditCardIconProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

const CreditCardIcon: React.FC<CreditCardIconProps> = ({ 
  size = 24, 
  color = '#FFFFFF',
  animated = false 
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00D4FF" />
            <Stop offset="100%" stopColor="#0099CC" />
          </LinearGradient>
        </Defs>
        <Rect
          x="2"
          y="4"
          width="20"
          height="16"
          rx="3"
          ry="3"
          fill={animated ? "url(#cardGradient)" : "none"}
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M2 10H22"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M6 16H8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M10 16H14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default CreditCardIcon;