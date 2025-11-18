import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CommodityIconProps {
  size?: number;
  color?: string;
}

const CommodityIcon: React.FC<CommodityIconProps> = ({ size = 24, color = '#FFB300' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        fill={color}
      />
      <Path
        d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
        fill={color}
        opacity="0.7"
      />
      <Path
        d="M12 12L2 7V12L12 17L22 12V7L12 12Z"
        fill={color}
        opacity="0.85"
      />
    </Svg>
  );
};

export default CommodityIcon;
