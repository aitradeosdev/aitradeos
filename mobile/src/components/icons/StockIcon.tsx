import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface StockIconProps {
  size?: number;
  color?: string;
}

const StockIcon: React.FC<StockIconProps> = ({ size = 24, color = '#4CAF50' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 18.5L9.5 12.5L13.5 16.5L22 6.92L20.59 5.51L13.5 13.5L9.5 9.5L2 17L3.5 18.5Z"
        fill={color}
      />
      <Path
        d="M22 12V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H11V5H4V19H20V12H22Z"
        fill={color}
      />
    </Svg>
  );
};

export default StockIcon;
