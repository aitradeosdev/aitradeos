import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ApiProvider } from './src/contexts/ApiContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { AdminProvider, useAdmin } from './src/contexts/AdminContext';
import { PaymentProvider } from './src/contexts/PaymentContext';

import MobileLandingScreen from './src/screens/MobileLandingScreen';
import { WebLandingPage } from './src/web-landing';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DeviceManagementScreen from './src/screens/DeviceManagementScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminOverviewScreen from './src/screens/admin/AdminOverviewScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminSettingsScreen from './src/screens/admin/AdminSettingsScreen';
import AdminPaymentsScreen from './src/screens/admin/AdminPaymentsScreen';
import AdminPaymentConfigScreen from './src/screens/admin/AdminPaymentConfigScreen';
import AdminContactConfigScreen from './src/screens/admin/AdminContactConfigScreen';
import ResultScreen from './src/screens/ResultScreen';
import PaymentSelectionScreen from './src/screens/PaymentSelectionScreen';
import PaymentAccountDetailsScreen from './src/screens/PaymentAccountDetailsScreen';
import PaymentConfirmationScreen from './src/screens/PaymentConfirmationScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';

import TabIcon from './src/components/TabIcon';

const LandingScreen = Platform.OS === 'web' ? WebLandingPage : MobileLandingScreen;

// SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  const [initialRoute, setInitialRoute] = useState('Landing');
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const getInitialRoute = async () => {
      try {
        let savedRoute;
        if (typeof window !== 'undefined') {
          savedRoute = localStorage.getItem('auth_current_screen');
        } else {
          savedRoute = await AsyncStorage.getItem('auth_current_screen');
        }
        
        if (savedRoute && ['Login', 'Register'].includes(savedRoute)) {
          setInitialRoute(savedRoute);
        }
      } catch (error) {
        console.log('Failed to get saved auth route');
      } finally {
        setIsReady(true);
      }
    };
    getInitialRoute();
  }, []);
  
  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }
  
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' }
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => (
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
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Analysis" 
      component={AnalysisScreen}
      options={{ tabBarLabel: 'Analyze' }}
    />
    <Tab.Screen 
      name="History" 
      component={HistoryScreen}
      options={{ tabBarLabel: 'History' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => (
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
    <Tab.Screen 
      name="Overview" 
      component={AdminOverviewScreen}
      options={{ tabBarLabel: 'Overview' }}
    />
    <Tab.Screen 
      name="Users" 
      component={AdminUsersScreen}
      options={{ tabBarLabel: 'Users' }}
    />
    <Tab.Screen 
      name="Payments" 
      component={AdminPaymentsScreen}
      options={{ tabBarLabel: 'Payments' }}
    />
    <Tab.Screen 
      name="AdminSettings" 
      component={AdminSettingsScreen}
      options={{ tabBarLabel: 'Settings' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#000000' }
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="Result" component={ResultScreen} />
    <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
    <Stack.Screen name="PaymentAccountDetails" component={PaymentAccountDetailsScreen} />
    <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
    <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { isAdminMode } = useAdmin();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  if (!user) return <AuthStack />;
  
  // If user is admin and in admin mode, show admin interface
  if (user.role === 'admin' && isAdminMode) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' }
        }}
      >
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
        <Stack.Screen name="AdminPaymentConfig" component={AdminPaymentConfigScreen} />
        <Stack.Screen name="AdminContactConfig" component={AdminContactConfigScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
        <Stack.Screen name="PaymentAccountDetails" component={PaymentAccountDetailsScreen} />
        <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      </Stack.Navigator>
    );
  }
  
  return <MainStack />;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error but don't crash
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading App...</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Minimal setup without SplashScreen
    const timer = setTimeout(() => {
      setAppIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminProvider>
          <ThemeProvider>
            <ApiProvider>
              <NotificationProvider>
                <PaymentProvider>
                  <NavigationContainer>
                    <StatusBar style="light" backgroundColor="#000000" />
                    <AppNavigator />
                  </NavigationContainer>
                </PaymentProvider>
              </NotificationProvider>
            </ApiProvider>
          </ThemeProvider>
        </AdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  }
});