import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BlogContextType {
  isBlogMode: boolean;
  setBlogMode: (mode: boolean) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const BLOG_MODE_KEY = 'huntr_ai_blog_mode';

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [isBlogMode, setIsBlogMode] = useState(false);

  useEffect(() => {
    loadBlogMode();
  }, []);

  const loadBlogMode = async () => {
    try {
      let storedMode;
      if (typeof window !== 'undefined') {
        storedMode = localStorage.getItem(BLOG_MODE_KEY);
      } else {
        storedMode = await AsyncStorage.getItem(BLOG_MODE_KEY);
      }
      if (storedMode === 'true') {
        setIsBlogMode(true);
      }
    } catch (error) {
      console.error('Failed to load blog mode:', error);
    }
  };

  const setBlogMode = async (mode: boolean) => {
    try {
      setIsBlogMode(mode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(BLOG_MODE_KEY, mode.toString());
      } else {
        await AsyncStorage.setItem(BLOG_MODE_KEY, mode.toString());
      }
    } catch (error) {
      console.error('Failed to save blog mode:', error);
    }
  };

  const value: BlogContextType = {
    isBlogMode,
    setBlogMode
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};