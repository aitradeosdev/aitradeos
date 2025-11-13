import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SparkleIconProps {
  size?: number;
  color?: string;
}

const SparkleIcon: React.FC<SparkleIconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill={color}
      />
      <Path
        d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z"
        fill={color}
      />
      <Path
        d="M5 14L5.5 16.5L8 17L5.5 17.5L5 20L4.5 17.5L2 17L4.5 16.5L5 14Z"
        fill={color}
      />
    </Svg>
  );
};

export default SparkleIcon;