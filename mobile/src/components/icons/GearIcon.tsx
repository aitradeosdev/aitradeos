import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface GearIconProps {
  size?: number;
  color?: string;
}

const GearIcon: React.FC<GearIconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <Path d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export default GearIcon;
