import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface WrenchIconProps {
  size?: number;
  color?: string;
}

const WrenchIcon: React.FC<WrenchIconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.7 6.3C15.3 5.7 16.2 5.7 16.8 6.3L17.7 7.2C18.3 7.8 18.3 8.7 17.7 9.3L9.3 17.7C8.7 18.3 7.8 18.3 7.2 17.7L6.3 16.8C5.7 16.2 5.7 15.3 6.3 14.7L14.7 6.3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 12L12 16M15 6L18 9M6 18L3 21M21 3L18 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default WrenchIcon;
