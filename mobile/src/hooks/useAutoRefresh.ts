import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAutoRefresh = (onRefresh: () => void | Promise<void>, _interval?: number) => {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        onRefresh();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [onRefresh]);
};