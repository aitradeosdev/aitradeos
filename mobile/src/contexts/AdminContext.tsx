import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminContextType {
  isAdminMode: boolean;
  setAdminMode: (mode: boolean) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_MODE_KEY = 'huntr_ai_admin_mode';

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    loadAdminMode();
  }, []);

  const loadAdminMode = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(ADMIN_MODE_KEY);
      if (storedMode === 'true') {
        setIsAdminMode(true);
      }
    } catch (error) {
      console.error('Failed to load admin mode:', error);
    }
  };

  const setAdminMode = async (mode: boolean) => {
    try {
      setIsAdminMode(mode);
      await AsyncStorage.setItem(ADMIN_MODE_KEY, mode.toString());
    } catch (error) {
      console.error('Failed to save admin mode:', error);
    }
  };

  const value: AdminContextType = {
    isAdminMode,
    setAdminMode
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};