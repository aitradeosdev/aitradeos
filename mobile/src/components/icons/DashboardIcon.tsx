import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface DashboardIconProps {
  size?: number;
  color?: string;
}

const DashboardIcon: React.FC<DashboardIconProps> = ({ size = 24, color = '#666666' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
        fill={color}
      />
    </Svg>
  );
};

export default DashboardIcon;