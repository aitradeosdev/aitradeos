import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MegaphoneIconProps {
  size?: number;
  color?: string;
}

const MegaphoneIcon: React.FC<MegaphoneIconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8C19.6569 8 21 9.34315 21 11C21 12.6569 19.6569 14 18 14M3 11C3 10.4477 3.44772 10 4 10H6.58579C6.851 10 7.10536 9.89464 7.29289 9.70711L13.2929 3.70711C13.9229 3.07714 15 3.52331 15 4.41421V17.5858C15 18.4767 13.9229 18.9229 13.2929 18.2929L7.29289 12.2929C7.10536 12.1054 6.851 12 6.58579 12H4C3.44772 12 3 11.5523 3 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 19C7 19 8 21 10 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default MegaphoneIcon;
