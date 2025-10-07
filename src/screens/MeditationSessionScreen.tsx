import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SPACING, SIZES } from '../constants/theme';

interface MeditationSessionScreenProps {
  route: {
    params: {
      title: string;
      duration: string;
      type: string;
    };
  };
  navigation: any;
}

const BREATH_CYCLE = 16; // Total seconds for one breath cycle (4+4+4+4)
const INHALE = 4;
const HOLD1 = 8; // 4+4
const EXHALE = 12; // 4+4+4
const HOLD2 = 16; // 4+4+4+4

const MeditationSessionScreen: React.FC<MeditationSessionScreenProps> = ({ route, navigation }) => {
  const { title, duration, type } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold2'>('inhale');
  const [breathText, setBreathText] = useState('Breathe In');
  const scaleAnim = useState(new Animated.Value(0.7))[0];

  // Determine if this is a breathing-focused session
  const isBreathingSession = type === 'Breathing';

  // Breathing cycle animation
  useEffect(() => {
    if (!isPlaying) return;

    const breathTimer = timer % BREATH_CYCLE;

    if (breathTimer < INHALE) {
      // Inhale phase (0-4s)
      setBreathPhase('inhale');
      setBreathText('Breathe In');
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: INHALE * 1000,
        useNativeDriver: true,
      }).start();
    } else if (breathTimer < HOLD1) {
      // Hold phase (4-8s)
      setBreathPhase('hold');
      setBreathText('Hold');
    } else if (breathTimer < EXHALE) {
      // Exhale phase (8-12s)
      setBreathPhase('exhale');
      setBreathText('Breathe Out');
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: INHALE * 1000,
        useNativeDriver: true,
      }).start();
    } else {
      // Hold phase 2 (12-16s)
      setBreathPhase('hold2');
      setBreathText('Hold');
    }
  }, [timer, isPlaying]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleEnd = () => {
    navigation.goBack();
  };

  const getBreathCount = () => {
    const breathTimer = timer % BREATH_CYCLE;
    if (breathTimer < INHALE) return Math.ceil(INHALE - breathTimer);
    if (breathTimer < HOLD1) return Math.ceil(HOLD1 - breathTimer);
    if (breathTimer < EXHALE) return Math.ceil(EXHALE - breathTimer);
    return Math.ceil(BREATH_CYCLE - breathTimer);
  };

  return (
    <GradientBackground colors={[COLORS.background, COLORS.primary + '30'] as any}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleEnd}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Show icon only for meditation sessions, not breathing */}
          {!isBreathingSession && (
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary] as any}
                style={styles.iconGradient}
              >
                <Ionicons name="sparkles" size={64} color={COLORS.white} />
              </LinearGradient>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.type}>{type} • {duration}</Text>

          {/* Show timer only for meditation sessions */}
          {!isBreathingSession && (
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>{formatTime(timer)}</Text>
            </View>
          )}

          {/* Breathing Guidance - Always show for breathing, conditionally for meditation */}
          <View style={styles.breathingContainer}>
            <Text style={[styles.breathingText, isBreathingSession && styles.breathingTextLarge]}>
              {breathText}
            </Text>
            {isPlaying && (
              <Text style={[styles.countText, isBreathingSession && styles.countTextLarge]}>
                {getBreathCount()}
              </Text>
            )}
          </View>

          {/* Animated Breathing Circle */}
          <View style={[
            styles.breathingCircle,
            isBreathingSession && styles.breathingCircleLarge
          ]}>
            <Animated.View
              style={[
                styles.pulse,
                isBreathingSession && styles.pulseLarge,
                {
                  transform: [{ scale: scaleAnim }],
                  backgroundColor: breathPhase === 'inhale' || breathPhase === 'hold'
                    ? COLORS.primary + '60'
                    : COLORS.tertiary + '60',
                },
              ]}
            />
            <View style={[
              styles.innerCircle,
              isBreathingSession && styles.innerCircleLarge
            ]}>
              <Ionicons
                name={breathPhase === 'inhale' ? 'arrow-down' : breathPhase === 'exhale' ? 'arrow-up' : 'ellipse'}
                size={isBreathingSession ? 48 : 32}
                color={COLORS.white}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={48}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <Text style={styles.instruction}>
            {isPlaying
              ? (isBreathingSession
                  ? 'Focus on your breath. Follow the circle and countdown.'
                  : 'Follow the circle and breathe with the rhythm')
              : (isBreathingSession
                  ? 'Press play to begin your breathing exercise'
                  : 'Press play to begin your meditation session')}
          </Text>
        </View>

        <TouchableOpacity style={styles.endButton} onPress={handleEnd}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  type: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  timerContainer: {
    marginBottom: SPACING.lg,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  breathingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    minHeight: 80,
  },
  breathingText: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  breathingTextLarge: {
    fontSize: 36,
    marginTop: SPACING.xxl,
  },
  countText: {
    fontSize: SIZES.font.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  countTextLarge: {
    fontSize: 96,
    marginTop: SPACING.lg,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  breathingCircleLarge: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  pulse: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  pulseLarge: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircleLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  instruction: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  endButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default MeditationSessionScreen;
