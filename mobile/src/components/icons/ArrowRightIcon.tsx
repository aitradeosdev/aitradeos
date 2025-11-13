import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ArrowRightIconProps {
  size?: number;
  color?: string;
}

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({ 
  size = 24, 
  color = '#FFFFFF'
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 12H19M19 12L12 5M19 12L12 19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default ArrowRightIcon;