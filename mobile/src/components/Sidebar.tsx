import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import TabIcon from './TabIcon';

interface SidebarProps {
  screens: Array<{
    name: string;
    component: React.ComponentType<any>;
    label: string;
  }>;
}

const Sidebar: React.FC<SidebarProps> = ({ screens }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width] = useState(new Animated.Value(240));

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    Animated.timing(width, {
      toValue: isCollapsed ? 240 : 70,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { width }]}>
      <View style={styles.header}>
        {!isCollapsed && <Text style={styles.logo}>Huntr AI</Text>}
        <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d={isCollapsed ? "M9 18L15 12L9 6" : "M15 18L9 12L15 6"}
              stroke="#666666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {screens.map(screen => {
          const isActive = route.name === screen.name;
          return (
            <TouchableOpacity
              key={screen.name}
              style={[styles.menuItem, isActive && styles.menuItemActive, isCollapsed && styles.menuItemCollapsed]}
              onPress={() => navigation.navigate(screen.name as never)}
              activeOpacity={0.7}
            >
              <TabIcon 
                name={screen.name.toLowerCase()} 
                focused={isActive} 
                size={22} 
              />
              {!isCollapsed && (
                <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                  {screen.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRightWidth: 1,
    borderRightColor: '#333333',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleButton: {
    padding: 4,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00D4FF',
    letterSpacing: -0.5,
  },
  menu: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    gap: 12,
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  menuTextActive: {
    color: '#00D4FF',
  },
});

export default Sidebar;
