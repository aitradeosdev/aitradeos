import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Sidebar from './Sidebar';
import TabIcon from './TabIcon';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && width >= 1024;
const isTablet = Platform.OS === 'web' && width >= 768 && width < 1024;

interface ResponsiveNavProps {
  screens: Array<{
    name: string;
    component: React.ComponentType<any>;
    label: string;
  }>;
  children?: React.ReactNode;
}

const ResponsiveNav: React.FC<ResponsiveNavProps> = ({ screens, children }) => {
  if (isDesktop || isTablet) {
    return (
      <View style={styles.desktopContainer}>
        <Sidebar screens={screens} />
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => (
          <TabIcon name={route.name.toLowerCase()} focused={focused} size={size} />
        ),
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#333333',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4
        }
      })}
    >
      {screens.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{ tabBarLabel: screen.label }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
});

export default ResponsiveNav;
