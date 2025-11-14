import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ChartIconProps {
  size?: number;
  color?: string;
}

const ChartIcon: React.FC<ChartIconProps> = ({ size = 24, color = '#667eea' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3v18h18M7 12l4-4 4 4 4-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ChartIcon;