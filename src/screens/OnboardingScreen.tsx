// OnboardingScreen.tsx - QHHT-inspired onboarding experience
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import StorageService, { UserProfile } from '../services/StorageService';
import NotificationService from '../services/NotificationService';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome, Eternal Soul',
    description: 'You are not just a body with a soul - you are a soul temporarily experiencing a human body. This journey is about remembering who you truly are.',
    icon: 'planet',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'Quantum Consciousness',
    description: 'Inspired by Dolores Cannon\'s work, explore parallel realities where your desires already exist. Your consciousness creates your reality.',
    icon: 'git-network',
    color: COLORS.tertiary,
  },
  {
    id: '3',
    title: 'Soul Remembrance',
    description: 'Through meditation and visualization, reconnect with your soul\'s essence and access the infinite wisdom of your higher self.',
    icon: 'sparkles',
    color: COLORS.secondary,
  },
  {
    id: '4',
    title: 'Manifest Your Reality',
    description: 'Create vision boards, set intentions, and take inspired actions aligned with your soul\'s purpose to manifest your deepest desires.',
    icon: 'bulb',
    color: COLORS.accent,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Welcome', 'Please enter your name to continue your soul journey');
      return;
    }

    try {
      // Request notification permissions
      const hasPermission = await NotificationService.requestPermissions();

      // Create initial user profile
      const profile: UserProfile = {
        id: Date.now().toString(),
        name: name.trim(),
        isPremium: false,
        onboardingCompleted: true,
        preferences: {
          language: 'en',
          theme: 'dark',
          reminderTime: reminderTime,
          soundEnabled: true,
        },
        stats: {
          streak: 0,
          lastActiveDate: '',
          totalSessions: 0,
          totalMinutes: 0,
        },
      };

      await StorageService.saveUserProfile(profile);

      // Schedule daily affirmation if permissions granted
      if (hasPermission) {
        await NotificationService.scheduleDailyAffirmation({
          enabled: true,
          time: reminderTime,
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Unable to complete setup. Please try again.');
    }
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const isLastSlide = index === slides.length - 1;

    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={80} color={item.color} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {isLastSlide && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>What shall we call you, soul seeker?</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>
                Daily Soul Reminder
              </Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor={COLORS.textSecondary}
                value={reminderTime}
                onChangeText={setReminderTime}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.hint}>
                We'll send you a daily affirmation at this time
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.gradientMid, COLORS.background]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
                index === currentIndex && { backgroundColor: slides[currentIndex].color },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.tertiary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Begin Journey' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    paddingTop: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 0.6,
    justifyContent: 'flex-start',
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: SIZES.font.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: SPACING.md,
  },
  inputContainer: {
    marginTop: SPACING.xl,
    width: '100%',
  },
  inputLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SPACING.md,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  hint: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary + '40',
    marginHorizontal: SPACING.xs,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default OnboardingScreen;
