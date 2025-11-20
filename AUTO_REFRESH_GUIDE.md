# Auto-Refresh Implementation Guide

## How to Add Auto-Refresh to Any Screen

The `useAutoRefresh` hook provides automatic background data refresh without page reload.

### Basic Implementation

```typescript
import { useAutoRefresh } from '../hooks/useAutoRefresh';

// Inside your component:
const YourScreen = () => {
  const [data, setData] = useState(null);
  
  // Your data loading function
  const loadData = async () => {
    const response = await apiService.getData();
    setData(response.data);
  };
  
  // Add auto-refresh (silent background refresh)
  useAutoRefresh({
    onRefresh: async () => {
      try {
        const response = await apiService.getData();
        setData(response.data);
      } catch (error) {
        // Silent fail - don't show errors for background refresh
      }
    },
    interval: 60000, // 60 seconds (adjust as needed)
    enabled: true
  });
  
  // Initial load
  useEffect(() => {
    loadData();
  }, []);
  
  // ... rest of component
};
```

### Screens That Need Auto-Refresh

1. **HistoryScreen** - Refresh analysis history
2. **ProfileScreen** - Refresh user profile data
3. **AnalysisScreen** - Refresh usage stats
4. **AnalysisV2Screen** - Refresh usage stats
5. **PaymentSelectionScreen** - Refresh payment status
6. **NotificationDetailScreen** - Refresh notifications
7. **AdminPaymentsScreen** - Refresh pending payments
8. **AdminOverviewScreen** - Refresh admin stats

### Recommended Intervals

- **User data** (profile, settings): 60000ms (1 minute)
- **Usage stats**: 30000ms (30 seconds)
- **Payment status**: 10000ms (10 seconds)
- **Notifications**: 30000ms (30 seconds)
- **Admin data**: 30000ms (30 seconds)

### Example: HistoryScreen

```typescript
import { useAutoRefresh } from '../hooks/useAutoRefresh';

const HistoryScreen = () => {
  const [analyses, setAnalyses] = useState([]);
  
  const loadHistory = async () => {
    const response = await apiService.getAnalysisHistory();
    setAnalyses(response.data.analyses);
  };
  
  // Auto-refresh every 60 seconds
  useAutoRefresh({
    onRefresh: async () => {
      try {
        const response = await apiService.getAnalysisHistory();
        setAnalyses(response.data.analyses);
      } catch (error) {}
    },
    interval: 60000,
    enabled: true
  });
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  // ... rest of component
};
```

### Features

- ✅ **Silent refresh** - Updates data without showing loading states
- ✅ **App state aware** - Pauses when app is in background
- ✅ **Auto-resume** - Refreshes immediately when app returns to foreground
- ✅ **Configurable interval** - Set custom refresh intervals per screen
- ✅ **Enable/disable** - Can be toggled on/off dynamically

### Notes

- The hook automatically cleans up intervals on unmount
- Background refreshes should fail silently (no error alerts)
- Use manual refresh (pull-to-refresh) for user-initiated updates
- Adjust intervals based on data importance and API rate limits
