import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface LogoutIconProps {
  size?: number;
  color?: string;
}

const LogoutIcon: React.FC<LogoutIconProps> = ({ size = 24, color = '#EF4444' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default LogoutIcon;