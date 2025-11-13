import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface CopyIconProps {
  size?: number;
  color?: string;
}

const CopyIcon: React.FC<CopyIconProps> = ({ 
  size = 24, 
  color = '#FFFFFF'
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x="9"
          y="9"
          width="13"
          height="13"
          rx="2"
          ry="2"
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
          stroke={color}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

export default CopyIcon;