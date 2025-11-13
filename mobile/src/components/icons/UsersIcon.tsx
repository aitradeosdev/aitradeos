import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface UsersIconProps {
  size?: number;
  color?: string;
}

const UsersIcon: React.FC<UsersIconProps> = ({ size = 24, color = '#666666' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
        fill={color}
      />
      <Path
        d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
        fill={color}
      />
      <Path
        d="M21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10Z"
        fill={color}
      />
      <Path
        d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z"
        fill={color}
      />
      <Path
        d="M22 18C22 19.1046 21.1046 20 20 20H18V18C18 16.3431 17.3284 14.8434 16.2426 13.7574C18.3284 14.8434 20 16.3431 20 18H22Z"
        fill={color}
      />
      <Path
        d="M2 18C2 16.3431 3.67157 14.8434 5.75736 13.7574C4.67157 14.8434 4 16.3431 4 18V20H2V18Z"
        fill={color}
      />
    </Svg>
  );
};

export default UsersIcon;