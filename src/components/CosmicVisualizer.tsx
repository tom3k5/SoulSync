// CosmicVisualizer.tsx - Advanced 60fps pulsing meditation visualizer
// Uses react-native-reanimated for buttery smooth native animations
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface CosmicVisualizerProps {
  isActive: boolean; // Playing or speaking
  frequency?: string; // Solfeggio frequency for color mapping
  size?: number;
}

// Map solfeggio frequencies to cosmic color schemes
const getFrequencyColors = (frequency?: string): string[] => {
  if (!frequency) return [COLORS.primary, COLORS.tertiary, COLORS.accent];

  const freq = frequency.toLowerCase();

  if (freq.includes('396')) {
    // Liberation from fear - Red/Orange
    return ['#E63946', '#F77F00', '#D62828'];
  } else if (freq.includes('417')) {
    // Facilitating change - Orange/Yellow
    return ['#F77F00', '#FCBF49', '#F9844A'];
  } else if (freq.includes('432')) {
    // Universal harmony - Green/Cyan
    return ['#06FFA5', '#4ECDC4', '#1A936F'];
  } else if (freq.includes('528')) {
    // Love & DNA repair - Gold/Green
    return [COLORS.secondary, '#06FFA5', '#4ECDC4'];
  } else if (freq.includes('639')) {
    // Connection & relationships - Pink/Purple
    return ['#FF006E', '#8338EC', '#FB5607'];
  } else if (freq.includes('741')) {
    // Awakening intuition - Purple/Blue
    return [COLORS.tertiary, COLORS.primary, '#7209B7'];
  } else if (freq.includes('852')) {
    // Spiritual order - Deep Purple/Violet
    return ['#7209B7', '#560BAD', '#3A0CA3'];
  }

  // Default cosmic colors
  return [COLORS.primary, COLORS.tertiary, COLORS.accent];
};

const CosmicVisualizer: React.FC<CosmicVisualizerProps> = ({
  isActive,
  frequency,
  size = 320,
}) => {
  // Shared values for smooth 60fps animations
  const outerPulse = useSharedValue(1);
  const middlePulse = useSharedValue(1);
  const innerPulse = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Particle ring animations
  const particle1 = useSharedValue(0);
  const particle2 = useSharedValue(0);
  const particle3 = useSharedValue(0);
  const particle4 = useSharedValue(0);

  const colors = getFrequencyColors(frequency);

  useEffect(() => {
    if (isActive) {
      // Fade in
      opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });

      // Outer ring - slow, large pulse (breathing rhythm)
      outerPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 3500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
          withTiming(1, { duration: 3500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
        ),
        -1,
        false
      );

      // Middle ring - medium pulse (heart rhythm)
      middlePulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(1, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) })
        ),
        -1,
        false
      );

      // Inner core - fast pulse (energy flow)
      innerPulse.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Gentle rotation (quantum field spin)
      rotation.value = withRepeat(
        withTiming(360, { duration: 30000, easing: Easing.linear }),
        -1,
        false
      );

      // Sacred geometry particles orbiting
      particle1.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );
      particle2.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );
      particle3.value = withRepeat(
        withTiming(360, { duration: 12000, easing: Easing.linear }),
        -1,
        false
      );
      particle4.value = withRepeat(
        withTiming(360, { duration: 14000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      // Fade out and reset
      opacity.value = withTiming(0, { duration: 500 });
      outerPulse.value = withTiming(1, { duration: 500 });
      middlePulse.value = withTiming(1, { duration: 500 });
      innerPulse.value = withTiming(1, { duration: 500 });
      rotation.value = withTiming(0, { duration: 500 });
      particle1.value = withTiming(0, { duration: 500 });
      particle2.value = withTiming(0, { duration: 500 });
      particle3.value = withTiming(0, { duration: 500 });
      particle4.value = withTiming(0, { duration: 500 });
    }
  }, [isActive]);

  // Animated styles for each layer
  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: outerPulse.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value * 0.3,
  }));

  const middleRingStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: middlePulse.value },
      { rotate: `${-rotation.value * 1.5}deg` },
    ],
    opacity: opacity.value * 0.5,
  }));

  const innerCoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerPulse.value }],
    opacity: opacity.value * 0.8,
  }));

  const centerGlowStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(innerPulse.value, [1, 1.25], [1, 1.4]) },
    ],
    opacity: opacity.value * interpolate(innerPulse.value, [1, 1.25], [0.6, 0.9]),
  }));

  // Particle styles
  const createParticleStyle = (particleValue: Animated.SharedValue<number>, delay: number = 0) =>
    useAnimatedStyle(() => {
      const angle = (particleValue.value + delay) * (Math.PI / 180);
      const radius = size * 0.45;

      return {
        transform: [
          { translateX: Math.cos(angle) * radius },
          { translateY: Math.sin(angle) * radius },
        ],
        opacity: opacity.value,
      };
    });

  const particle1Style = createParticleStyle(particle1, 0);
  const particle2Style = createParticleStyle(particle2, 90);
  const particle3Style = createParticleStyle(particle3, 180);
  const particle4Style = createParticleStyle(particle4, 270);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer ring - largest pulse */}
      <Animated.View style={[styles.ring, { width: size, height: size }, outerRingStyle]}>
        <LinearGradient
          colors={[colors[0] + '40', colors[1] + '20', colors[2] + '40']}
          style={styles.ringGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Middle ring */}
      <Animated.View
        style={[styles.ring, { width: size * 0.75, height: size * 0.75 }, middleRingStyle]}
      >
        <LinearGradient
          colors={[colors[1] + '50', colors[2] + '30', colors[0] + '50']}
          style={styles.ringGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Inner core */}
      <Animated.View
        style={[styles.ring, { width: size * 0.5, height: size * 0.5 }, innerCoreStyle]}
      >
        <LinearGradient
          colors={[colors[2] + '70', colors[0] + '50', colors[1] + '70']}
          style={styles.ringGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Center glow (pulsing energy core) */}
      <Animated.View
        style={[styles.centerGlow, { width: size * 0.3, height: size * 0.3 }, centerGlowStyle]}
      >
        <LinearGradient
          colors={[COLORS.secondary + 'FF', COLORS.secondary + '80', COLORS.secondary + '00']}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Sacred geometry particles */}
      <Animated.View style={[styles.particle, particle1Style]}>
        <View style={[styles.particleDot, { backgroundColor: colors[0] }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, particle2Style]}>
        <View style={[styles.particleDot, { backgroundColor: colors[1] }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, particle3Style]}>
        <View style={[styles.particleDot, { backgroundColor: colors[2] }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, particle4Style]}>
        <View style={[styles.particleDot, { backgroundColor: COLORS.secondary }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  ringGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  centerGlow: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default CosmicVisualizer;
