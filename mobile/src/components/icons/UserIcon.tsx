import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface UserIconProps {
  size?: number;
  color?: string;
}

const UserIcon: React.FC<UserIconProps> = ({ size = 24, color = '#6B7280' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={2} />
        <Path
          d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default UserIcon;