import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface DevicesIconProps {
  size?: number;
  color?: string;
}

const DevicesIcon: React.FC<DevicesIconProps> = ({ size = 24, color = '#6B7280' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x={4}
          y={4}
          width={16}
          height={12}
          rx={2}
          stroke={color}
          strokeWidth={2}
        />
        <Path
          d="M8 20h8M12 16v4"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Rect
          x={1}
          y={8}
          width={4}
          height={6}
          rx={1}
          stroke={color}
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
};

export default DevicesIcon;