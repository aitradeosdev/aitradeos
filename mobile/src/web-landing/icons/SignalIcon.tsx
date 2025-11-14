import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SignalIconProps {
  size?: number;
  color?: string;
}

const SignalIcon: React.FC<SignalIconProps> = ({ size = 24, color = '#667eea' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 20h20M2 20l7-7m0 0l3-3m0 0l3 3m0 0l7-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 4l4 4 4-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SignalIcon;