import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import AudioService, { AudioTrack } from '../services/AudioService';
import StorageService, { UserProfile } from '../services/StorageService';

const SoundscapesScreen = () => {
  const navigation = useNavigation();
  const [soundscapes, setSoundscapes] = useState<AudioTrack[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get only soundscape tracks
    const soundscapeTracks = AudioService.getSoundscapes();
    const userProfile = await StorageService.getUserProfile();

    setSoundscapes(soundscapeTracks);
    setProfile(userProfile);
  };

  const playSoundscape = (track: AudioTrack) => {
    if (track.isPremium && !profile?.isPremium) {
      Alert.alert(
        'Premium Content',
        'This soundscape requires a Premium subscription. Upgrade to access all healing frequencies.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => (navigation as any).navigate('PremiumUpgrade') }
        ]
      );
      return;
    }

    (navigation as any).navigate('MeditationPlayer', { track });
  };

  const renderSoundscapeCard = (track: AudioTrack) => (
    <TouchableOpacity
      key={track.id}
      onPress={() => playSoundscape(track)}
      style={styles.soundscapeCard}
    >
      <Card style={styles.card}>
        <LinearGradient
          colors={[
            track.frequency?.includes('528') ? COLORS.primary + '30' :
            track.frequency?.includes('432') ? COLORS.secondary + '30' :
            COLORS.tertiary + '30',
            COLORS.surface
          ]}
          style={styles.cardGradient}
        >
          <View style={styles.soundscapeHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={track.frequency ? "radio" : "musical-notes"}
                size={28}
                color={COLORS.secondary}
              />
            </View>
            {track.isPremium && !profile?.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>

          <Text style={styles.soundscapeTitle}>{track.title}</Text>
          {track.frequency && (
            <View style={styles.frequencyDisplay}>
              <Ionicons name="pulse" size={20} color={COLORS.primary} />
              <Text style={styles.frequencyText}>{track.frequency}</Text>
            </View>
          )}
          <Text style={styles.soundscapeDescription}>{track.description}</Text>

          <View style={styles.soundscapeFooter}>
            <View style={styles.durationContainer}>
              <Ionicons name="infinite" size={20} color={COLORS.textSecondary} />
              <Text style={styles.duration}>Loop</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playSoundscape(track)}
            >
              <Ionicons name="play" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const solfeggioFrequencies = [
    { freq: '396 Hz', benefit: 'Liberating Guilt & Fear' },
    { freq: '417 Hz', benefit: 'Facilitating Change' },
    { freq: '432 Hz', benefit: 'Universal Harmony' },
    { freq: '528 Hz', benefit: 'DNA Repair & Love' },
    { freq: '639 Hz', benefit: 'Relationships & Connection' },
    { freq: '741 Hz', benefit: 'Awakening Intuition' },
    { freq: '852 Hz', benefit: 'Spiritual Order' },
    { freq: '963 Hz', benefit: 'Divine Consciousness' },
  ];

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Soundscapes</Text>
            <Text style={styles.subtitle}>Healing Frequencies & Ambient Tones</Text>
          </View>
        </View>

        {!profile?.isPremium && (
          <TouchableOpacity onPress={() => (navigation as any).navigate('PremiumUpgrade')}>
            <Card style={styles.premiumBanner}>
              <LinearGradient
                colors={[COLORS.tertiary + '20', COLORS.primary + '20']}
                style={styles.premiumGradient}
              >
                <View style={styles.premiumContent}>
                  <Ionicons name="star" size={24} color={COLORS.secondary} />
                  <Text style={styles.premiumBannerText}>
                    Unlock all solfeggio frequencies & healing soundscapes
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.secondary} />
                </View>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="radio-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Solfeggio Frequencies</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Ancient healing frequencies used for spiritual awakening and DNA repair
          </Text>

          <View style={styles.frequencyList}>
            {solfeggioFrequencies.map((item, index) => (
              <View key={index} style={styles.frequencyItem}>
                <View style={styles.frequencyDot} />
                <Text style={styles.frequencyItemText}>
                  <Text style={styles.frequencyItemFreq}>{item.freq}</Text> - {item.benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="musical-notes" size={24} color={COLORS.tertiary} />
            <Text style={styles.sectionTitle}>Available Soundscapes</Text>
          </View>
        </View>

        <View style={styles.soundscapeList}>
          {soundscapes.map(renderSoundscapeCard)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎵 Soundscapes loop continuously for extended meditation and relaxation sessions
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
    marginBottom: SPACING.md,
  },
  frequencyList: {
    gap: SPACING.sm,
  },
  frequencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  frequencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  frequencyItemText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  frequencyItemFreq: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  soundscapeList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  soundscapeCard: {
    marginBottom: SPACING.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  soundscapeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  soundscapeTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  frequencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  frequencyText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  soundscapeDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  soundscapeFooter: {
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
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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

export default SoundscapesScreen;
