import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { COLORS, SPACING, SIZES } from '../constants/theme';

interface MindfulActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
  prompt: string;
}

const MindfulMomentScreen = () => {
  const navigation = useNavigation();
  const [selectedActivity, setSelectedActivity] = useState<MindfulActivity | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const activities: MindfulActivity[] = [
    {
      id: '1',
      title: 'Five Senses Check',
      description: 'Ground yourself in the present moment',
      duration: '2 min',
      icon: 'eye-outline',
      color: COLORS.primary,
      prompt: 'Name 5 things you can see\n4 things you can touch\n3 things you can hear\n2 things you can smell\n1 thing you can taste',
    },
    {
      id: '2',
      title: 'Gratitude Reflection',
      description: 'Cultivate appreciation for life',
      duration: '3 min',
      icon: 'heart-outline',
      color: COLORS.secondary,
      prompt: 'Take a moment to think of three things you\'re grateful for today. They can be as simple as a warm cup of tea or as profound as a loving relationship. Let gratitude fill your heart.',
    },
    {
      id: '3',
      title: 'Body Scan',
      description: 'Release tension and reconnect',
      duration: '5 min',
      icon: 'body-outline',
      color: COLORS.success,
      prompt: 'Close your eyes. Start at the crown of your head and slowly scan down through your body. Notice any tension or discomfort. Breathe into those areas and release.',
    },
    {
      id: '4',
      title: 'Loving Kindness',
      description: 'Send compassion to yourself and others',
      duration: '4 min',
      icon: 'leaf-outline',
      color: COLORS.tertiary,
      prompt: 'May I be happy. May I be healthy. May I be safe. May I live with ease.\n\nNow extend these wishes to loved ones, then to all beings.',
    },
    {
      id: '5',
      title: 'Present Moment Awareness',
      description: 'Simply be here, now',
      duration: '3 min',
      icon: 'infinite-outline',
      color: COLORS.warning,
      prompt: 'Let go of the past. Release thoughts of the future. Simply be present in this exact moment. Notice your breath, your body, the space around you. This is all that exists.',
    },
  ];

  useEffect(() => {
    if (!isActive || timeRemaining === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const handleStartActivity = (activity: MindfulActivity) => {
    setSelectedActivity(activity);
    const durationInSeconds = parseInt(activity.duration) * 60;
    setTimeRemaining(durationInSeconds);
    setIsActive(true);
  };

  const handlePauseResume = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    setIsActive(false);
    setSelectedActivity(null);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedActivity) {
    return (
      <GradientBackground>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleStop} style={styles.backButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedActivity.title}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.activeContainer}>
            <LinearGradient
              colors={[selectedActivity.color + '40', selectedActivity.color + '10']}
              style={styles.timerContainer}
            >
              <Ionicons
                name={selectedActivity.icon as any}
                size={64}
                color={selectedActivity.color}
              />
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerLabel}>Time Remaining</Text>
            </LinearGradient>

            <Card style={styles.promptCard}>
              <Text style={styles.promptText}>{selectedActivity.prompt}</Text>
            </Card>

            <View style={styles.activeControls}>
              <TouchableOpacity
                onPress={handlePauseResume}
                style={[styles.controlButton, styles.primaryButton]}
              >
                <Ionicons
                  name={isActive ? 'pause' : 'play'}
                  size={32}
                  color={COLORS.white}
                />
                <Text style={styles.primaryButtonText}>
                  {isActive ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStop}
                style={[styles.controlButton, styles.secondaryButton]}
              >
                <Ionicons name="stop" size={28} color={COLORS.error} />
              </TouchableOpacity>
            </View>

            <Card style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.warning} />
              <Text style={styles.tipText}>
                Take your time. There's no rush. Simply be present with each moment.
              </Text>
            </Card>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mindful Moments</Text>
          <View style={styles.placeholder} />
        </View>

        <Card style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="leaf" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.introTitle}>Take a Mindful Pause</Text>
          <Text style={styles.introText}>
            Choose a quick mindfulness practice to reconnect with your soul's essence and
            find peace in the present moment.
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Practices</Text>
          <View style={styles.activitiesContainer}>
            {activities.map((activity) => (
              <Card
                key={activity.id}
                onPress={() => handleStartActivity(activity)}
                style={styles.activityCard}
              >
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={32} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <View style={styles.activityMeta}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{activity.duration}</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={24} color={activity.color} />
              </Card>
            ))}
          </View>
        </View>

        <Card style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits of Mindful Moments</Text>
          <View style={styles.benefitsList}>
            {[
              'Reduce stress and anxiety',
              'Improve focus and clarity',
              'Enhance emotional well-being',
              'Deepen connection with present',
              'Cultivate inner peace',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  introCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  introIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  introTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  activitiesContainer: {
    gap: SPACING.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  activityTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  metaText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  benefitsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  benefitsTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  benefitsList: {
    gap: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  // Active session styles
  activeContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  timerContainer: {
    alignItems: 'center',
    padding: SPACING.xl * 2,
    borderRadius: SIZES.radius.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timerLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  promptCard: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  promptText: {
    fontSize: SIZES.font.lg,
    color: COLORS.text,
    lineHeight: 32,
    textAlign: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
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
  tipCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
});

export default MindfulMomentScreen;
