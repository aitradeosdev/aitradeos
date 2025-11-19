import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ReplyIconProps {
  size?: number;
  color?: string;
}

const ReplyIcon: React.FC<ReplyIconProps> = ({ size = 24, color = '#000' }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default ReplyIcon;