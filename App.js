import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import SubscriptionService from './src/services/SubscriptionService';

export default function App() {
  useEffect(() => {
    // Initialize RevenueCat on app start
    const initializeSubscriptions = async () => {
      try {
        await SubscriptionService.initialize();
        console.log('SubscriptionService initialized');
      } catch (error) {
        console.error('Failed to initialize SubscriptionService:', error);
        // App continues to work even if RevenueCat fails
      }
    };

    initializeSubscriptions();
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}
