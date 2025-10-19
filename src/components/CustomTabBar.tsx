// CustomTabBar.tsx - World-class animated tab bar with cosmic design
// Implements best UX practices: haptic feedback, smooth animations, accessibility
import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { COLORS, SPACING, SIZES } from '../constants/theme';

// Tab configuration with icons and cosmic labels
const TAB_CONFIG: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}> = {
  Home: {
    icon: 'home-outline',
    iconFocused: 'home',
    label: 'Home',
    color: COLORS.primary,
  },
  Journeys: {
    icon: 'planet-outline',
    iconFocused: 'planet',
    label: 'Journeys',
    color: COLORS.tertiary,
  },
  Soundscapes: {
    icon: 'radio-outline',
    iconFocused: 'radio',
    label: 'Sounds',
    color: COLORS.accent,
  },
  Breathe: {
    icon: 'water-outline',
    iconFocused: 'water',
    label: 'Breathe',
    color: '#06FFA5',
  },
  SoulTools: {
    icon: 'apps-outline',
    iconFocused: 'apps',
    label: 'Tools',
    color: COLORS.secondary,
  },
  Profile: {
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'Profile',
    color: COLORS.textSecondary,
  },
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // Animated indicator position
  const indicatorPosition = useSharedValue(0);
  const tabWidth = 100 / state.routes.length; // Percentage

  // Update indicator position when tab changes
  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 15,
      stiffness: 100,
    });
  }, [state.index]);

  // Animated indicator style
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          indicatorPosition.value,
          [0, 100],
          [0, state.routes.length * (SIZES.screenWidth / state.routes.length)],
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Cosmic glow effect */}
      <LinearGradient
        colors={[COLORS.background + '00', COLORS.primary + '10', COLORS.tertiary + '05']}
        style={styles.glow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Active tab indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <LinearGradient
          colors={[COLORS.secondary + 'FF', COLORS.secondary + '00']}
          style={styles.indicatorGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Tab buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name];

          // Skip hidden tabs (Journal, Affirmations, etc.)
          if (!config) return null;

          const onPress = () => {
            // Haptic feedback
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(
                isFocused
                  ? Haptics.ImpactFeedbackStyle.Light
                  : Haptics.ImpactFeedbackStyle.Medium
              );
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            // Stronger haptic on long press
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }

            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              isFocused={isFocused}
              icon={isFocused ? config.iconFocused : config.icon}
              label={config.label}
              color={config.color}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
            />
          );
        })}
      </View>
    </View>
  );
};

// Individual tab button component with animations
interface TabButtonProps {
  isFocused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  isFocused,
  icon,
  label,
  color,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const labelOpacity = useSharedValue(isFocused ? 1 : 0.6);

  // Animate on focus change
  useEffect(() => {
    if (isFocused) {
      // Pop animation
      iconScale.value = withSpring(1.15, { damping: 8 });
      scale.value = withSpring(1.05, { damping: 12 });
      labelOpacity.value = withTiming(1, { duration: 200 });
    } else {
      iconScale.value = withSpring(1);
      scale.value = withSpring(1);
      labelOpacity.value = withTiming(0.6, { duration: 200 });
    }
  }, [isFocused]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  // Press animations
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(isFocused ? 1.05 : 1, { damping: 10 });
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabContent, containerStyle]}>
        {/* Icon with glow effect when focused */}
        <Animated.View style={iconContainerStyle}>
          {isFocused && (
            <View style={[styles.iconGlow, { backgroundColor: color + '40' }]} />
          )}
          <Ionicons
            name={icon}
            size={isFocused ? 26 : 24}
            color={isFocused ? color : COLORS.textSecondary}
            style={styles.icon}
          />
        </Animated.View>

        {/* Label */}
        <Animated.Text
          style={[
            styles.label,
            labelStyle,
            {
              color: isFocused ? color : COLORS.textSecondary,
              fontWeight: isFocused ? '700' : '600',
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '20',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 88 : 65,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    width: `${100 / 6}%`, // 6 visible tabs
  },
  indicatorGradient: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xs,
    flex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.3,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default CustomTabBar;
