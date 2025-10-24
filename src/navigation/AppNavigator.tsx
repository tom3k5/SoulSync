import React, { useRef, useCallback } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
  DefaultTheme,
} from '@react-navigation/native';
import {  createNativeStackNavigator  } from '@react-navigation/native-stack';
import {  createBottomTabNavigator  } from '@react-navigation/bottom-tabs';
import {  Platform  } from 'react-native';
import * as Haptics from 'expo-haptics';

import {  useUser  } from '../contexts/UserContext';
import {  COLORS  } from '../constants/theme';
import CustomTabBar from '../components/CustomTabBar';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JournalScreen from '../screens/JournalScreen';
import MeditationScreen from '../screens/MeditationScreen';
import MeditationJourneysScreen from '../screens/MeditationJourneysScreen';
import SoundscapesScreen from '../screens/SoundscapesScreen';
import SoulToolsScreen from '../screens/SoulToolsScreen';
import MeditationSessionScreen from '../screens/MeditationSessionScreen';
import MeditationPlayerScreen from '../screens/MeditationPlayerScreen';
import LoginScreen from '../screens/LoginScreen';
import BreathingExerciseScreen from '../screens/BreathingExerciseScreen';
import MindfulMomentScreen from '../screens/MindfulMomentScreen';
import VisualizationScreen from '../screens/VisualizationScreen';
import VisionBoardScreen from '../screens/VisionBoardScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AffirmationScreen from '../screens/AffirmationScreen';
import ActionPlannerScreen from '../screens/ActionPlannerScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import {  QHHTGuide  } from '../components';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  QHHTGuide: undefined;
  MeditationSession: {
    title: string;
    duration: string;
    type: string;
  };
  MeditationPlayer: {
    track?: any;      // Optional for backwards compatibility
    trackId?: string; // Preferred for web - serializable
  };
  VisionBoard: undefined;
  BreathingExercise: undefined;
  MindfulMoment: undefined;
  PremiumUpgrade: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Journeys: undefined;
  Soundscapes: undefined;
  Breathe: undefined;
  SoulTools: undefined;
  Profile: undefined;
  // Keep these for internal navigation from SoulTools
  Journal?: undefined;
  Affirmations?: undefined;
  ActionPlanner?: undefined;
  VisionBoard?: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom navigation theme with cosmic colors
const CosmicTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.primary + '20',
    notification: COLORS.secondary,
  },
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerShown: false, // Hide headers for cleaner look
        // Smooth animations
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Journeys"
        component={MeditationJourneysScreen}
        options={{
          title: 'Meditation Journeys',
          tabBarLabel: 'Journeys',
        }}
      />
      <Tab.Screen
        name="Soundscapes"
        component={SoundscapesScreen}
        options={{
          title: 'Soundscapes',
          tabBarLabel: 'Sounds',
        }}
      />
      <Tab.Screen
        name="Breathe"
        component={BreathingExerciseScreen}
        options={{
          title: 'Breathing',
          tabBarLabel: 'Breathe',
        }}
      />
      <Tab.Screen
        name="SoulTools"
        component={SoulToolsScreen}
        options={{
          title: 'Soul Tools',
          tabBarLabel: 'Tools',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
      {/* Hidden tabs for internal navigation from SoulTools */}
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Affirmations"
        component={AffirmationScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="ActionPlanner"
        component={ActionPlannerScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="VisionBoard"
        component={VisionBoardScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useUser();
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(true); // Set to false for onboarding
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();

  // Navigation state change handler for analytics and deep linking
  const onStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName) {
      // Analytics tracking could go here
      console.log('Navigation:', previousRouteName, '->', currentRouteName);

      // Haptic feedback on navigation
      if (Platform.OS !== 'web' && currentRouteName) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Save the current route name for next change
    routeNameRef.current = currentRouteName;
  }, []);

  // Deep linking configuration
  const linking = {
    prefixes: ['soulsync://', 'https://soulsync.app'],
    config: {
      screens: {
        Onboarding: 'onboarding',
        Login: 'login',
        MainTabs: {
          screens: {
            Home: 'home',
            Journeys: 'journeys',
            Soundscapes: 'soundscapes',
            Breathe: 'breathe',
            SoulTools: 'tools',
            Profile: 'profile',
            Journal: 'journal',
            Affirmations: 'affirmations',
            ActionPlanner: 'planner',
            VisionBoard: 'vision-board',
          },
        },
        // Note: MeditationPlayer and other modals intentionally excluded from deep linking
        // They pass complex objects (AudioTrack) that cannot be serialized to URL
        // Access these screens only through internal navigation
        PremiumUpgrade: 'premium',
      },
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={CosmicTheme}
      linking={linking}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={onStateChange}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        {!isOnboardingComplete ? (
          <Stack.Screen
            name="Onboarding"
            options={{
              animation: 'fade',
            }}
          >
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={() => setIsOnboardingComplete(true)}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'fade',
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="MeditationSession"
              component={MeditationSessionScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="QHHTGuide"
              options={{
                headerShown: true,
                headerTitle: 'QHHT Guide',
                headerStyle: {
                  backgroundColor: COLORS.background,
                },
                headerTintColor: COLORS.text,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {() => (
                <QHHTGuide />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="MeditationPlayer"
              component={MeditationPlayerScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="MindfulMoment"
              component={MindfulMomentScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="PremiumUpgrade"
              component={PremiumUpgradeScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
