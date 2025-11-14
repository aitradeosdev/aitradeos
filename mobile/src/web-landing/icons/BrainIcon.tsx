import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

interface BrainIconProps {
  size?: number;
  color?: string;
}

const BrainIcon: React.FC<BrainIconProps> = ({ size = 24, color = '#667eea' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4C6 13.5 5 15.5 5 18c0 2.5 2.5 4 5.5 4h3c3 0 5.5-1.5 5.5-4 0-2.5-1-4.5-2.5-6 1-.5 1.5-2 1.5-4 0-3.5-2.5-6-6-6z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="9" r="1" fill={color} />
    <Circle cx="15" cy="9" r="1" fill={color} />
  </Svg>
);

export default BrainIcon;