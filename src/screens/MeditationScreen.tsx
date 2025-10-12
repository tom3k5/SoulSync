import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import AudioService, { AudioTrack } from '../services/AudioService';
import StorageService, { UserProfile } from '../services/StorageService';

interface MeditationSession {
  id: string;
  title: string;
  duration: string;
  type: string;
  icon: string;
  color: string;
}

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  sessionData?: MeditationSession | { title: string; duration: string; type: string };
}

const MeditationScreen = () => {
  const navigation = useNavigation();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [soundscapes, setSoundscapes] = useState<AudioTrack[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const meditationTracks = AudioService.getMeditationTracks();
    const soundscapeTracks = AudioService.getSoundscapes();
    const userProfile = await StorageService.getUserProfile();

    setTracks(meditationTracks);
    setSoundscapes(soundscapeTracks);
    setProfile(userProfile);
  };

  const startMeditation = (track: AudioTrack) => {
    if (track.isPremium && !profile?.isPremium) {
      Alert.alert(
        'Premium Content',
        'This meditation requires a Premium subscription. Upgrade to access all soul journeys.',
        [{ text: 'OK' }]
      );
      return;
    }

    (navigation as any).navigate('MeditationPlayer', { track });
  };

  const startBreathingExercise = () => {
    (navigation as any).navigate('BreathingExercise');
  };

  const durations = ['5', '10', '15', '20', '30'];

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Soul Remembrance</Text>
            <Text style={styles.subtitle}>Meditation Library</Text>
          </View>
        </View>

        <Button
          title="Learn About QHHT"
          onPress={() => (navigation as any).navigate('QHHTGuide')}
          variant="outline"
        />

        {!profile?.isPremium && (
          <Card style={styles.premiumBanner}>
            <LinearGradient
              colors={[COLORS.secondary + '20', COLORS.primary + '20']}
              style={styles.premiumGradient}
            >
              <Ionicons name="star" size={24} color={COLORS.secondary} />
              <Text style={styles.premiumText}>
                Free: 3 QHHT-inspired meditations • Premium: All {tracks.length} soul journeys
              </Text>
            </LinearGradient>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Inspired by Dolores Cannon's QHHT, these meditations guide you to reconnect with your eternal soul essence
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meditation Journeys</Text>
          <View style={styles.sessionsContainer}>
            {tracks.map((track) => (
              <Card
                key={track.id}
                onPress={() => startMeditation(track)}
                style={styles.sessionCard}
              >
                <View style={[styles.sessionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="radio-outline" size={32} color={COLORS.primary} />
                </View>
                <View style={styles.sessionContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.sessionTitle}>{track.title}</Text>
                    {track.isPremium && (
                      <Ionicons name="star" size={16} color={COLORS.secondary} />
                    )}
                  </View>
                  <Text style={styles.description} numberOfLines={2}>{track.description}</Text>
                  <View style={styles.sessionMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>{Math.round(track.duration / 60)} min</Text>
                    </View>
                    {track.frequency && (
                      <View style={styles.metaItem}>
                        <Ionicons name="analytics" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{track.frequency}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="play-circle" size={32} color={COLORS.primary} />
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soundscapes</Text>
          <View style={styles.sessionsContainer}>
            {soundscapes.map((track) => (
              <Card
                key={track.id}
                onPress={() => startMeditation(track)}
                style={styles.soundscapeCard}
              >
                <View style={[styles.soundscapeIcon, { backgroundColor: COLORS.tertiary + '20' }]}>
                  <Ionicons name="musical-notes" size={24} color={COLORS.tertiary} />
                </View>
                <View style={styles.soundscapeContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.soundscapeTitle}>{track.title}</Text>
                    {track.isPremium && (
                      <Ionicons name="star" size={14} color={COLORS.secondary} />
                    )}
                  </View>
                  <Text style={styles.soundscapeDesc}>{track.description}</Text>
                  {track.frequency && (
                    <Text style={styles.frequency}>{track.frequency}</Text>
                  )}
                </View>
                <Ionicons name="play-circle" size={28} color={COLORS.tertiary} />
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breathing Exercises</Text>
          <Card onPress={startBreathingExercise}>
            <View style={styles.breathingCard}>
              <View style={styles.breathingIcon}>
                <Ionicons name="water" size={40} color={COLORS.accent} />
              </View>
              <View style={styles.breathingContent}>
                <Text style={styles.breathingTitle}>Box Breathing</Text>
                <Text style={styles.breathingDescription}>
                  4-4-4-4 technique for instant calm and presence
                </Text>
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
    marginBottom: SPACING.lg,
  },
  pageTitle: {
    fontSize: SIZES.font.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  premiumBanner: {
    padding: 0,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  premiumText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  featureCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  featureGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  featureSubtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  durationButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  durationButtonActive: {
    backgroundColor: COLORS.white,
  },
  durationText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  durationTextActive: {
    color: COLORS.primary,
  },
  startButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
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
  sessionsContainer: {
    gap: SPACING.md,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sessionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sessionTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  breathingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  breathingIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.tertiary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingContent: {
    flex: 1,
  },
  breathingTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  breathingDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  soundscapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  soundscapeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundscapeContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  soundscapeTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  soundscapeDesc: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  frequency: {
    fontSize: SIZES.font.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

export default MeditationScreen;
