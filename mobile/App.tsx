import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Linking } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Platform, Text, Dimensions, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ApiProvider } from './src/contexts/ApiContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { AdminProvider, useAdmin } from './src/contexts/AdminContext';
import { BlogProvider, useBlog } from './src/contexts/BlogContext';
import { PaymentProvider } from './src/contexts/PaymentContext';

import MobileLandingScreen from './src/screens/MobileLandingScreen';
import Landing from './src/web-landing/Landing';
import About from './src/web-landing/About';
import Privacy from './src/web-landing/Privacy';
import Terms from './src/web-landing/Terms';
import Disclaimer from './src/web-landing/Disclaimer';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import AnalysisV2Screen from './src/screens/AnalysisV2Screen';

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
import AdminLogosScreen from './src/screens/admin/AdminLogosScreen';
import AdminPopupMessagesScreen from './src/screens/admin/AdminPopupMessagesScreen';
import UserDetailsScreen from './src/screens/admin/UserDetailsScreen';
import UserDevicesScreen from './src/screens/admin/UserDevicesScreen';
import SiteConfigScreen from './src/screens/admin/SiteConfigScreen';
import ResultScreen from './src/screens/ResultScreen';
import PaymentSelectionScreen from './src/screens/PaymentSelectionScreen';
import PaymentAccountDetailsScreen from './src/screens/PaymentAccountDetailsScreen';
import PaymentConfirmationScreen from './src/screens/PaymentConfirmationScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import PublicBlogListScreen from './src/screens/PublicBlogListScreen';

import TabIcon from './src/components/TabIcon';
import Sidebar from './src/components/Sidebar';

const LandingScreen = Platform.OS === 'web' ? Landing : MobileLandingScreen;

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
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Disclaimer" component={Disclaimer} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={require('./src/screens/auth/VerifyEmailScreen').default} />
      <Stack.Screen name="PublicBlogList" component={PublicBlogListScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
    </Stack.Navigator>
  );
};

const mainScreens = [
  { name: 'Home', component: HomeScreen, label: 'Home' },
  { name: 'Analysis', component: AnalysisScreen, label: 'Analyze' },
  { name: 'History', component: HistoryScreen, label: 'History' },
  { name: 'Profile', component: ProfileScreen, label: 'Profile' },
];

const MainTabs = () => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const isTablet = Platform.OS === 'web' && width >= 768 && width < 1024;

  if (isDesktop || isTablet) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar screens={mainScreens} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {mainScreens.map(screen => (
            <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
          ))}
        </Stack.Navigator>
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
      {mainScreens.map(screen => (
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

const adminScreens = [
  { name: 'Overview', component: AdminOverviewScreen, label: 'Overview' },
  { name: 'Users', component: AdminUsersScreen, label: 'Users' },
  { name: 'Payments', component: AdminPaymentsScreen, label: 'Payments' },
  { name: 'AdminSettings', component: AdminSettingsScreen, label: 'Settings' },
];

const AdminTabs = () => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const isTablet = Platform.OS === 'web' && width >= 768 && width < 1024;

  if (isDesktop || isTablet) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar screens={adminScreens} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {adminScreens.map(screen => (
            <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
          ))}
        </Stack.Navigator>
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
      {adminScreens.map(screen => (
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
    <Stack.Screen name="AnalysisV2" component={AnalysisV2Screen} />
    <Stack.Screen name="Result" component={ResultScreen} />
    <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
    <Stack.Screen name="PaymentAccountDetails" component={PaymentAccountDetailsScreen} />
    <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
    <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    <Stack.Screen name="PublicBlogList" component={PublicBlogListScreen} />
    <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { isAdminMode } = useAdmin();
  const { isBlogMode } = useBlog();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  if (!user) return <AuthStack />;
  
  // If user is admin and in blog mode, show blog interface
  if (user.role === 'admin' && isBlogMode) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' }
        }}
      >
        <Stack.Screen name="BlogDashboard" component={require('./src/screens/blog/BlogDashboardScreen').default} />
        <Stack.Screen name="BlogEditor" component={require('./src/screens/blog/BlogEditorScreen').default} />
        <Stack.Screen name="BlogList" component={require('./src/screens/blog/BlogListScreen').default} />
      </Stack.Navigator>
    );
  }
  
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
        <Stack.Screen name="AdminLogos" component={AdminLogosScreen} />
        <Stack.Screen name="AdminPopupMessages" component={AdminPopupMessagesScreen} />
        <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
        <Stack.Screen name="UserDevicesScreen" component={UserDevicesScreen} />
        <Stack.Screen name="SiteConfigScreen" component={SiteConfigScreen} />
        <Stack.Screen name="BlogDashboard" component={require('./src/screens/blog/BlogDashboardScreen').default} />
        <Stack.Screen name="BlogEditor" component={require('./src/screens/blog/BlogEditorScreen').default} />
        <Stack.Screen name="BlogList" component={require('./src/screens/blog/BlogListScreen').default} />
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
          <BlogProvider>
            <ThemeProvider>
              <ApiProvider>
                <NotificationProvider>
                  <PaymentProvider>
                    <NavigationContainer
                      linking={{
                        prefixes: ['http://localhost:8081', 'https://huntr-ai.netlify.app'],
                        config: {
                          screens: {
                            Landing: '',
                            PublicBlogList: 'blog',
                            BlogDetail: 'blog/:slug',
                            About: 'about',
                            Privacy: 'privacy',
                            Terms: 'terms',
                            Disclaimer: 'disclaimer',
                            Login: 'login',
                            Register: 'register'
                          }
                        }
                      }}
                    >
                      <StatusBar style="light" backgroundColor="#000000" />
                      <AppNavigator />
                    </NavigationContainer>
                  </PaymentProvider>
                </NotificationProvider>
              </ApiProvider>
            </ThemeProvider>
          </BlogProvider>
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