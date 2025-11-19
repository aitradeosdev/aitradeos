import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SidewaysReplyIconProps {
  size?: number;
  color?: string;
}

const SidewaysReplyIcon: React.FC<SidewaysReplyIconProps> = ({ 
  size = 24, 
  color = '#666' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"
        fill={color}
        transform="rotate(90 12 12)"
      />
    </Svg>
  );
};

export default SidewaysReplyIcon;