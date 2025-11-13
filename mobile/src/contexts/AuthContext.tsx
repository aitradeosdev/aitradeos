import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  settings: {
    allowDataTraining: boolean;
    notifications: boolean;
    theme: 'light' | 'dark';
    aiModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    welcomeMessageShown?: boolean;
    analysisAgreementAccepted?: boolean;
    analysisAgreementAcceptedAt?: string;
  };
  subscription: {
    plan: 'free' | 'premium';
    startDate: string;
    endDate?: string;
  };
  apiUsage: {
    totalAnalyses: number;
    monthlyAnalyses: number;
    lastResetDate: string;
  };
  lastLogin: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>;
  updateSettings: (updates: Partial<User['settings']>) => Promise<void>;
  updateAnalysisAgreement: (accepted: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'huntr_ai_token';
const USER_KEY = 'huntr_ai_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiService.setAuthToken(storedToken);

        try {
          await verifyToken(storedToken);
          await registerCurrentDevice();
        } catch (error) {
          console.log('Token verification failed, clearing auth');
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (token: string) => {
    const response = await apiService.post('/auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.data.valid) {
      throw new Error('Invalid token');
    }
  };

  const registerCurrentDevice = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('device_id') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('device_id', deviceId);
      
      const deviceInfo = {
        deviceId,
        name: `${typeof window !== 'undefined' ? 'Web Browser' : 'Mobile App'} - ${new Date().toLocaleDateString()}`,
        type: typeof window !== 'undefined' ? 'desktop' : 'mobile',
        platform: typeof window !== 'undefined' ? navigator.platform : 'React Native',
        browser: typeof window !== 'undefined' ? navigator.userAgent.split(' ').pop() : undefined
      };
      
      await apiService.registerDevice(deviceInfo);
    } catch (error) {
      console.error('Device registration failed:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', email);
      const response = await apiService.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      apiService.setAuthToken(newToken);
      
      await registerCurrentDevice();
      await refreshUser();
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    username: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      setIsLoading(true);
      console.log('Attempting registration with:', email, username);
      const response = await apiService.post('/auth/register', {
        email,
        password,
        username,
        firstName,
        lastName
      });
      console.log('Registration response:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      apiService.setAuthToken(newToken);
      
      await registerCurrentDevice();
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    apiService.setAuthToken(null);
  };

  const updateProfile = async (updates: Partial<User['profile']>) => {
    try {
      const response = await apiService.put('/auth/profile', updates);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Profile update failed');
    }
  };

  const updateSettings = async (updates: Partial<User['settings']>) => {
    try {
      const response = await apiService.put('/auth/settings', updates);
      const updatedSettings = response.data.settings;
      
      const updatedUser = {
        ...user!,
        settings: updatedSettings
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Settings update failed');
    }
  };

  const updateAnalysisAgreement = async (accepted: boolean) => {
    try {
      const response = await apiService.put('/auth/analysis-agreement', { accepted });
      
      if (!accepted && response.data.requiresLogout) {
        await logout();
        throw new Error(response.data.error || 'Agreement declined - logged out');
      }
      
      const updatedSettings = response.data.settings;
      const updatedUser = {
        ...user!,
        settings: updatedSettings
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error: any) {
      if (error.response?.status === 403) {
        await logout();
      }
      throw new Error(error.response?.data?.error || 'Agreement update failed');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.get('/auth/profile');
      const userData = response.data.user;
      
      setUser(userData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error: any) {
      console.error('User refresh failed:', error);
      if (error.response?.status === 401) {
        await clearAuth();
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateSettings,
    updateAnalysisAgreement,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};