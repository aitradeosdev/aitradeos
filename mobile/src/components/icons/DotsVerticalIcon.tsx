import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface DotsVerticalIconProps {
  size?: number;
  color?: string;
}

const DotsVerticalIcon: React.FC<DotsVerticalIconProps> = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.5" fill={color}/>
    <Circle cx="12" cy="12" r="1.5" fill={color}/>
    <Circle cx="12" cy="19" r="1.5" fill={color}/>
  </Svg>
);

export default DotsVerticalIcon;
