import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ChartIconProps {
  size?: number;
  color?: string;
}

const ChartIcon: React.FC<ChartIconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3V21H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 9L12 6L16 10L20 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 14H9V18H7V14Z"
        fill={color}
      />
      <Path
        d="M11 12H13V18H11V12Z"
        fill={color}
      />
      <Path
        d="M15 16H17V18H15V16Z"
        fill={color}
      />
    </Svg>
  );
};

export default ChartIcon;