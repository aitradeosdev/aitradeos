import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface AdminIconProps {
  size?: number;
  color?: string;
}

const AdminIcon: React.FC<AdminIconProps> = ({ size = 24, color = '#666666' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill={color}
      />
      <Path
        d="M19 15L19.5 17L21 17.5L19.5 18L19 20L18.5 18L17 17.5L18.5 17L19 15Z"
        fill={color}
      />
      <Path
        d="M5 15L5.5 17L7 17.5L5.5 18L5 20L4.5 18L3 17.5L4.5 17L5 15Z"
        fill={color}
      />
    </Svg>
  );
};

export default AdminIcon;