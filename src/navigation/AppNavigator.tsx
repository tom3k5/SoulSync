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
import MeditationSessionScreen from '../screens/MeditationSessionScreen';
import MeditationPlayerScreen from '../screens/MeditationPlayerScreen';
import LoginScreen from '../screens/LoginScreen';
import BreathingExerciseScreen from '../screens/BreathingExerciseScreen';
import MindfulMomentScreen from '../screens/MindfulMomentScreen';
import VisualizationScreen from '../screens/VisualizationScreen';
import VisionBoardScreen from '../screens/VisionBoardScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
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
};

export type MainTabParamList = {
  Home: undefined;
  Meditation: undefined;
  VisionBoard: undefined;
  Journal: undefined;
  Profile: undefined;
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
          } else if (route.name === 'Meditation') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'VisionBoard') {
            iconName = focused ? 'git-network' : 'git-network-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
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
        name="Meditation"
        component={MeditationScreen}
        options={{
          title: 'Meditate',
          tabBarLabel: 'Meditate',
        }}
      />
      <Tab.Screen
        name="VisionBoard"
        component={VisionBoardScreen}
        options={{
          title: 'Visualize',
          tabBarLabel: 'Visualize',
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: 'Journal',
          tabBarLabel: 'Journal',
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
              name="BreathingExercise"
              component={BreathingExerciseScreen}
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
