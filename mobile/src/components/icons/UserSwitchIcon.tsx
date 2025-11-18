import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface UserSwitchIconProps {
  size?: number;
  color?: string;
}

const UserSwitchIcon: React.FC<UserSwitchIconProps> = ({ size = 24, color = '#6B7280' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
        <Path
          d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"
          stroke={color}
          strokeWidth={2}
        />
        <Path
          d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default UserSwitchIcon;