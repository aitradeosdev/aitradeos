import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface RocketIconProps {
  size?: number;
  color?: string;
}

const RocketIcon: React.FC<RocketIconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
        fill={color}
      />
      <Path
        d="M5 16L3 21L8 19L5 16Z"
        fill={color}
      />
      <Path
        d="M19 16L21 21L16 19L19 16Z"
        fill={color}
      />
    </Svg>
  );
};

export default RocketIcon;