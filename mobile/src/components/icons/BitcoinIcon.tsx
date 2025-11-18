import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BitcoinIconProps {
  size?: number;
  color?: string;
}

const BitcoinIcon: React.FC<BitcoinIconProps> = ({ size = 24, color = '#F7931A' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.5 10.5C17.5 9.12 16.38 8 15 8H13V13H15C16.38 13 17.5 11.88 17.5 10.5Z"
        fill={color}
      />
      <Path
        d="M15 14H13V19H15C16.38 19 17.5 17.88 17.5 16.5C17.5 15.12 16.38 14 15 14Z"
        fill={color}
      />
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15 20H13V21H11V20H9V18H11V6H9V4H11V3H13V4H15C17.21 4 19 5.79 19 8C19 9.45 18.32 10.75 17.27 11.56C18.48 12.32 19.25 13.71 19.25 15.25C19.25 17.87 17.12 20 14.5 20H13Z"
        fill={color}
      />
    </Svg>
  );
};

export default BitcoinIcon;
