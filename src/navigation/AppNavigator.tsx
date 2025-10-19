import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useUser } from '../contexts/UserContext';
import { COLORS } from '../constants/theme';

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
import { QHHTGuide } from '../components';

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
    track: any;
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

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Journeys') {
            iconName = focused ? 'planet' : 'planet-outline';
          } else if (route.name === 'Soundscapes') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Breathe') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'SoulTools') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={focused ? size + 2 : size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textSecondary + '80',
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.primary + '20',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 65,
          elevation: 8,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
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
      })}
      screenListeners={{
        tabPress: () => {
          // Add haptic feedback on tab press
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
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

  return (
    <NavigationContainer>
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
