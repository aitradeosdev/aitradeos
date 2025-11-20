import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(darkMode);
    
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  const colors = {
    bg: isDark ? '#000' : '#fff',
    text: isDark ? '#fff' : '#000',
    textMuted: isDark ? '#9ca3af' : '#4b5563',
    textLight: isDark ? '#6b7280' : '#666',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    cardBg: isDark ? '#111' : '#fff',
    sectionBg: isDark ? '#0a0a0a' : '#f9fafb',
    navBg: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
    btnPrimary: isDark ? '#fff' : '#000',
    btnPrimaryText: isDark ? '#000' : '#fff',
  };

  return { isDark, colors };
};
