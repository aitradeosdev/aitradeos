import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface StarIconProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

const StarIcon: React.FC<StarIconProps> = ({ 
  size = 24, 
  color = '#FFFFFF',
  animated = false 
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD700" />
            <Stop offset="50%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#FF8C00" />
          </LinearGradient>
        </Defs>
        <Path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={animated ? "url(#starGradient)" : color}
          stroke={color}
          strokeWidth="0.5"
        />
      </Svg>
    </View>
  );
};

export default StarIcon;