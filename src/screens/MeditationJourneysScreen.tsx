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

const MeditationJourneysScreen = () => {
  const navigation = useNavigation();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get only meditation tracks (QHHT journeys)
    const meditationTracks = AudioService.getMeditationTracks().filter(
      track => track.category === 'meditation'
    );
    const userProfile = await StorageService.getUserProfile();

    setTracks(meditationTracks);
    setProfile(userProfile);
  };

  const startMeditation = (track: AudioTrack) => {
    if (track.isPremium && !profile?.isPremium) {
      Alert.alert(
        'Premium Content',
        'This meditation requires a Premium subscription. Upgrade to access all soul journeys.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => (navigation as any).navigate('PremiumUpgrade') }
        ]
      );
      return;
    }

    // Pass ONLY trackId for web compatibility
    // React Navigation on web cannot serialize complex objects to URL
    (navigation as any).navigate('MeditationPlayer', {
      trackId: track.id,
    });
  };

  const renderTrackCard = (track: AudioTrack) => (
    <TouchableOpacity
      key={track.id}
      onPress={() => startMeditation(track)}
      style={styles.trackCard}
    >
      <Card style={styles.card}>
        <View style={styles.trackHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="planet" size={32} color={COLORS.secondary} />
          </View>
          {track.isPremium && !profile?.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={14} color={COLORS.secondary} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        <Text style={styles.trackTitle}>{track.title}</Text>
        <Text style={styles.trackDescription}>{track.description}</Text>

        <View style={styles.trackFooter}>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.duration}>{Math.floor(track.duration / 60)} min</Text>
          </View>
          {track.frequency && (
            <View style={styles.frequencyBadge}>
              <Ionicons name="radio-outline" size={14} color={COLORS.tertiary} />
              <Text style={styles.frequency}>{track.frequency}</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Meditation Journeys</Text>
            <Text style={styles.subtitle}>QHHT-Inspired Soul Exploration</Text>
          </View>
        </View>

        <Button
          title="Learn About QHHT"
          onPress={() => (navigation as any).navigate('QHHTGuide')}
          variant="outline"
          icon="information-circle-outline"
        />

        {!profile?.isPremium && (
          <TouchableOpacity onPress={() => (navigation as any).navigate('PremiumUpgrade')}>
            <Card style={styles.premiumBanner}>
              <LinearGradient
                colors={[COLORS.secondary + '20', COLORS.primary + '20']}
                style={styles.premiumGradient}
              >
                <View style={styles.premiumContent}>
                  <Ionicons name="star" size={24} color={COLORS.secondary} />
                  <Text style={styles.premiumBannerText}>
                    Unlock all {tracks.length} QHHT meditation journeys
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.secondary} />
                </View>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Guided QHHT Meditations</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Experience Dolores Cannon's Quantum Healing Hypnosis Technique through guided meditation journeys
          </Text>
        </View>

        <View style={styles.trackList}>
          {tracks.map(renderTrackCard)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌌 Each journey includes background music with healing frequencies and optional voice guidance
          </Text>
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
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  premiumBanner: {
    marginVertical: SPACING.lg,
    padding: 0,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: SPACING.lg,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  premiumBannerText: {
    flex: 1,
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  section: {
    marginVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  trackList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  trackCard: {
    marginBottom: SPACING.sm,
  },
  card: {
    padding: SPACING.lg,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: SIZES.radius.sm,
  },
  premiumText: {
    fontSize: SIZES.font.xs,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  trackTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trackDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  trackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  duration: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.tertiary + '20',
    borderRadius: SIZES.radius.sm,
  },
  frequency: {
    fontSize: SIZES.font.xs,
    color: COLORS.tertiary,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MeditationJourneysScreen;
