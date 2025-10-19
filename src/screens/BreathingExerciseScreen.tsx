import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import AudioService from '../services/AudioService';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const BreathingExerciseScreen = () => {
  const navigation = useNavigation();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [counter, setCounter] = useState(4);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState('box');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [backgroundMusicLoaded, setBackgroundMusicLoaded] = useState(false);

  const breathingPatterns = {
    box: { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: '4-4-4-4 pattern for stress relief' },
    calm: { name: '4-7-8 Breathing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: 'Dr. Weil\'s technique for relaxation' },
    energize: { name: 'Energizing Breath', inhale: 4, hold1: 4, exhale: 6, hold2: 0, description: 'Revitalize your energy' },
    deep: { name: 'Deep Relaxation', inhale: 6, hold1: 2, exhale: 8, hold2: 2, description: 'Deep breathing for calm' },
  };

  const currentPattern = breathingPatterns[selectedPattern as keyof typeof breathingPatterns];

  // Initialize background music
  useEffect(() => {
    const loadBackgroundMusic = async () => {
      try {
        await AudioService.initialize();
        await AudioService.loadTrack({
          id: 'breathing_background',
          title: 'Breathing Background',
          duration: 600,
          isPremium: false,
          category: 'soundscape',
          uri: require('../../assets/audio/breathing_background.mp3'),
        });
        setBackgroundMusicLoaded(true);
      } catch (error) {
        console.error('Error loading breathing background music:', error);
      }
    };
    loadBackgroundMusic();

    return () => {
      AudioService.stop();
      AudioService.unload();
      AudioService.stopSpeech();
    };
  }, []);

  // Voice guidance for each phase
  useEffect(() => {
    if (!isActive || counter !== getCurrentPhaseDuration()) return;

    const phaseText = getPhaseText();
    AudioService.speakText(phaseText, {
      rate: 0.75,
      pitch: 0.9,
      language: 'en-US',
    });
  }, [phase, isActive]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev === 1) {
          // Move to next phase
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold1';
            if (currentPhase === 'hold1') return 'exhale';
            if (currentPhase === 'exhale') {
              if (currentPattern.hold2 > 0) return 'hold2';
              setTotalBreaths((prev) => prev + 1);
              return 'inhale';
            }
            if (currentPhase === 'hold2') {
              setTotalBreaths((prev) => prev + 1);
              return 'inhale';
            }
            return 'inhale';
          });
          return getCurrentPhaseDuration();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, currentPattern]);

  useEffect(() => {
    if (isActive) {
      animateCircle();
    }
  }, [phase, isActive]);

  const getCurrentPhaseDuration = () => {
    if (phase === 'inhale') return currentPattern.inhale;
    if (phase === 'hold1') return currentPattern.hold1;
    if (phase === 'exhale') return currentPattern.exhale;
    if (phase === 'hold2') return currentPattern.hold2;
    return 4;
  };

  const animateCircle = () => {
    const duration = getCurrentPhaseDuration() * 1000;

    if (phase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleStartStop = async () => {
    if (!isActive) {
      setIsActive(true);
      setPhase('inhale');
      setCounter(currentPattern.inhale);
      setTotalBreaths(0);

      // Start background music
      if (backgroundMusicLoaded) {
        try {
          await AudioService.play();
        } catch (error) {
          console.error('Error playing background music:', error);
        }
      }
    } else {
      setIsActive(false);
      scaleAnim.setValue(1);
      pulseAnim.setValue(1);

      // Pause background music
      try {
        await AudioService.pause();
        AudioService.stopSpeech();
      } catch (error) {
        console.error('Error pausing background music:', error);
      }
    }
  };

  const handleReset = async () => {
    setIsActive(false);
    setPhase('inhale');
    setCounter(4);
    setTotalBreaths(0);
    scaleAnim.setValue(1);
    pulseAnim.setValue(1);

    // Stop and reset audio
    try {
      await AudioService.stop();
      AudioService.stopSpeech();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return 'Ready';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return COLORS.primary;
      case 'hold1': return COLORS.warning;
      case 'exhale': return COLORS.tertiary;
      case 'hold2': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Breathing Exercises</Text>
            <Text style={styles.headerSubtitle}>Calm Your Mind & Body</Text>
          </View>
        </View>

        {!isActive && (
          <View style={styles.patternSelector}>
            {Object.entries(breathingPatterns).map(([key, pattern]) => (
              <Card
                key={key}
                onPress={() => setSelectedPattern(key)}
                style={[
                  styles.patternCard,
                  selectedPattern === key && styles.patternCardActive,
                ]}
              >
                <Text style={[
                  styles.patternName,
                  selectedPattern === key && styles.patternNameActive,
                ]}>
                  {pattern.name}
                </Text>
                <Text style={styles.patternDescription}>{pattern.description}</Text>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.breathingContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: isActive ? scaleAnim : pulseAnim }],
                backgroundColor: getPhaseColor(),
              },
            ]}
          >
            <Text style={styles.counterText}>{counter}</Text>
          </Animated.View>

          <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
            {getPhaseText()}
          </Text>
        </View>

        {isActive && (
          <Card style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Breaths Completed</Text>
              <Text style={styles.statValue}>{totalBreaths}</Text>
            </View>
          </Card>
        )}

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleStartStop}
            style={[styles.controlButton, styles.primaryButton]}
          >
            <Ionicons
              name={isActive ? 'pause' : 'play'}
              size={32}
              color={COLORS.white}
            />
            <Text style={styles.primaryButtonText}>
              {isActive ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>

          {isActive && (
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.controlButton, styles.secondaryButton]}
            >
              <Ionicons name="refresh" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <Card style={styles.instructionCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.instructionText}>
            Find a comfortable position. Follow the breathing rhythm guided by the circle.
            The circle expands as you inhale and contracts as you exhale.
          </Text>
        </Card>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  patternSelector: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  patternCard: {
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternCardActive: {
    borderColor: COLORS.primary,
  },
  patternName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  patternNameActive: {
    color: COLORS.primary,
  },
  patternDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  counterText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  phaseText: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
  },
  statsCard: {
    marginBottom: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  controlButton: {
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
  },
  primaryButtonText: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  secondaryButton: {
    width: 64,
    backgroundColor: COLORS.surface,
  },
  instructionCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  instructionText: {
    flex: 1,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default BreathingExerciseScreen;
