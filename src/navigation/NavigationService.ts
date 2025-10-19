// NavigationService.ts - Advanced navigation utilities and guards
// Implements best practices: type safety, navigation guards, analytics hooks
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Navigation helper functions with type safety
export const NavigationService = {
  // Navigate to any screen
  navigate<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as any, params as any);
    }
  },

  // Go back
  goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  // Reset navigation stack
  reset(routeName: keyof RootStackParamList) {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName as any }],
      });
    }
  },

  // Get current route name
  getCurrentRoute() {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },

  // Navigate to premium upgrade
  navigateToPremium() {
    this.navigate('PremiumUpgrade');
  },

  // Navigate to meditation player
  navigateToMeditation(track: any) {
    this.navigate('MeditationPlayer', { track });
  },

  // Navigate to journal with optional prompt
  navigateToJournal(prompt?: string) {
    this.navigate('MainTabs');
    // Would need additional logic to navigate to Journal tab with params
  },
};

// Navigation guards - check conditions before navigation
export const NavigationGuards = {
  // Check if user has premium access
  requirePremium(isPremium: boolean, onDenied?: () => void): boolean {
    if (!isPremium) {
      onDenied?.();
      NavigationService.navigateToPremium();
      return false;
    }
    return true;
  },

  // Check if user is authenticated
  requireAuth(isAuthenticated: boolean): boolean {
    if (!isAuthenticated) {
      NavigationService.reset('Login');
      return false;
    }
    return true;
  },

  // Check if onboarding is complete
  requireOnboarding(isComplete: boolean): boolean {
    if (!isComplete) {
      NavigationService.reset('Onboarding');
      return false;
    }
    return true;
  },
};

// Analytics hooks for navigation tracking
export const NavigationAnalytics = {
  // Track screen view
  trackScreenView(screenName: string, params?: Record<string, any>) {
    console.log('[Analytics] Screen View:', screenName, params);
    // Integrate with analytics service (Firebase, Mixpanel, etc.)
  },

  // Track navigation event
  trackNavigationEvent(from: string, to: string, params?: Record<string, any>) {
    console.log('[Analytics] Navigation:', from, '->', to, params);
    // Integrate with analytics service
  },

  // Track meditation start
  trackMeditationStart(trackId: string, trackTitle: string) {
    console.log('[Analytics] Meditation Started:', trackId, trackTitle);
    // Track engagement metrics
  },

  // Track premium upgrade attempt
  trackPremiumUpgradeView(source: string) {
    console.log('[Analytics] Premium Upgrade View:', source);
    // Track conversion funnel
  },
};

// Gesture navigation patterns
export const GesturePatterns = {
  // Swipe right to go back
  enableSwipeBack: true,

  // Swipe down to dismiss modal
  enableSwipeToDismiss: true,

  // Double tap to like/favorite (for future features)
  enableDoubleTap: false,

  // Long press for context menu
  enableLongPress: true,
};

// Smart navigation helpers
export const SmartNavigation = {
  // Navigate to appropriate screen based on user state
  navigateToHome(isOnboarded: boolean, isAuthenticated: boolean) {
    if (!isOnboarded) {
      NavigationService.reset('Onboarding');
    } else if (!isAuthenticated) {
      NavigationService.reset('Login');
    } else {
      NavigationService.reset('MainTabs');
    }
  },

  // Navigate with fallback
  navigateOrFallback(
    routeName: keyof RootStackParamList,
    fallback: keyof RootStackParamList,
    params?: any
  ) {
    try {
      NavigationService.navigate(routeName, params);
    } catch (error) {
      console.error('Navigation failed, using fallback:', error);
      NavigationService.navigate(fallback);
    }
  },

  // Navigate with loading state
  async navigateAsync(
    routeName: keyof RootStackParamList,
    params?: any,
    onLoading?: (loading: boolean) => void
  ) {
    try {
      onLoading?.(true);
      // Simulate async operation (e.g., data prefetch)
      await new Promise((resolve) => setTimeout(resolve, 300));
      NavigationService.navigate(routeName, params);
    } catch (error) {
      console.error('Async navigation failed:', error);
    } finally {
      onLoading?.(false);
    }
  },
};

export default NavigationService;
