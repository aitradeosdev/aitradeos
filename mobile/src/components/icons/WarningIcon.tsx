import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface WarningIconProps {
  size?: number;
  color?: string;
}

const WarningIcon: React.FC<WarningIconProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 20h20L12 2zm0 5l7 13H5l7-13z"
        fill={color}
      />
      <Path
        d="M11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"
        fill={color}
      />
    </Svg>
  );
};

export default WarningIcon;
