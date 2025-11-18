import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAutoRefreshOptions {
  onRefresh: () => void;
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export const useAutoRefresh = ({ 
  onRefresh, 
  interval = 30000, // 30 seconds default
  enabled = true 
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;

    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        onRefresh();
      }, interval);
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, refresh immediately
        onRefresh();
        startInterval();
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background, clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
      appStateRef.current = nextAppState;
    };

    // Start initial interval
    startInterval();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription?.remove();
    };
  }, [onRefresh, interval, enabled]);

  const forceRefresh = () => {
    onRefresh();
  };

  return { forceRefresh };
};