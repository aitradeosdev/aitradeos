import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ToggleIconProps {
  size?: number;
  color?: string;
}

const ToggleIcon: React.FC<ToggleIconProps> = ({ size = 24, color = '#6B7280' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 13l3 3 7-7"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default ToggleIcon;