import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';
import { COLORS, SPACING, SIZES } from '../constants/theme';

const HomeScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation();

  // Soul-focused daily affirmations
  const dailyAffirmations = [
    "You are an eternal soul experiencing a temporary human journey.",
    "Your consciousness creates the reality you perceive.",
    "Every breath connects you to the infinite universe within.",
    "You are exactly where your soul needs to be right now.",
    "The past and future exist only in your mind. Be present.",
  ];

  const randomAffirmation = dailyAffirmations[Math.floor(Math.random() * dailyAffirmations.length)];

  const quickActions = [
    { id: '1', title: 'Daily Meditation', icon: 'sparkles', color: COLORS.primary, route: 'Journeys' },
    { id: '2', title: 'Soul Journal', icon: 'book', color: COLORS.secondary, route: 'Journal' },
    { id: '3', title: 'Breathing Exercise', icon: 'water', color: COLORS.success, route: 'Breathe' },
    { id: '4', title: 'Mindful Moment', icon: 'leaf', color: COLORS.tertiary, route: 'MindfulMoment' },
  ];

  const stats = [
    { label: 'Streak', value: '7 days', icon: 'flame' },
    { label: 'Minutes', value: '145', icon: 'time' },
    { label: 'Sessions', value: '23', icon: 'checkmark-circle' },
  ];

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || 'Soul Seeker'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color={COLORS.text} />
          </View>
        </View>

        <Card style={styles.quoteCard}>
          <LinearGradient
            colors={[COLORS.primary + '30', COLORS.secondary + '30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <Ionicons name="planet" size={24} color={COLORS.primary} />
            <Text style={styles.quoteText}>
              {randomAffirmation}
            </Text>
            <Text style={styles.quoteAuthor}>- Daily Soul Wisdom</Text>
          </LinearGradient>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={24} color={COLORS.primary} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {quickActions.map((action) => (
              <Card
                key={action.id}
                onPress={() => navigation.navigate(action.route as never)}
                style={styles.actionCard}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="sparkles" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Morning Meditation</Text>
                <Text style={styles.activityTime}>Today, 8:00 AM • 10 min</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="book" size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Journal Entry</Text>
                <Text style={styles.activityTime}>Yesterday, 9:30 PM</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="water" size={20} color={COLORS.tertiary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Breathing Exercise</Text>
                <Text style={styles.activityTime}>2 days ago • 5 min</Text>
              </View>
            </View>
          </Card>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteCard: {
    marginBottom: SPACING.xl,
    padding: 0,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  quoteText: {
    fontSize: SIZES.font.lg,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  quoteAuthor: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
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
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  activityCard: {
    gap: SPACING.lg,
  },
  activityItem: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
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
  activityTime: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
