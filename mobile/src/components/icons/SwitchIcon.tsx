import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SwitchIconProps {
  size?: number;
  color?: string;
}

const SwitchIcon: React.FC<SwitchIconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M16 3H19C20.1046 3 21 3.89543 21 5V8M8 21H5C3.89543 21 3 20.1046 3 19V16M16 21H19C20.1046 21 21 20.1046 21 19V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M9 12H15M15 12L12 9M15 12L12 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default SwitchIcon;
