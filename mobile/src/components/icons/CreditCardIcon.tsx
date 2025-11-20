import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface CreditCardIconProps {
  size?: number;
  color?: string;
}

const CreditCardIcon: React.FC<CreditCardIconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2"/>
    <Path d="M2 10H22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export default CreditCardIcon;
