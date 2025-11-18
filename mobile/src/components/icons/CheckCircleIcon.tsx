import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface CheckCircleIconProps {
  size?: number;
  color?: string;
}

const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({ size = 24, color = '#10B981' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={10} fill={color} />
        <Path
          d="M9 12l2 2 4-4"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default CheckCircleIcon;