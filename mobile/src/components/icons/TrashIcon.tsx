import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TrashIconProps {
  size?: number;
  color?: string;
}

const TrashIcon: React.FC<TrashIconProps> = ({ size = 24, color = '#EF4444' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default TrashIcon;