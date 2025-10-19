// MeditationPlayerScreen.tsx - Masterpiece Meditation Experience
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AVPlaybackStatus } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GradientBackground from '../components/GradientBackground';
import CosmicVisualizer from '../components/CosmicVisualizer';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import AudioService, { AudioTrack } from '../services/AudioService';
import StorageService from '../services/StorageService';
import MeditationScriptService from '../services/MeditationScriptService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MeditationPlayerScreenProps {
  route: {
    params: {
      track?: AudioTrack;
      trackId?: string;
    };
  };
  navigation: any;
}

const MeditationPlayerScreen: React.FC<MeditationPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  console.log('=== MEDITATION PLAYER RENDER ===');
  console.log('route.params:', route.params);

  const paramTrack = route.params?.track;
  const paramTrackId = route.params?.trackId;

  const [track, setTrack] = useState<AudioTrack | null>(paramTrack || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(track?.duration ? track.duration * 1000 : 0);
  const [volume, setVolume] = useState(1.0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [useTTS, setUseTTS] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // Reanimated shared values for buttery smooth 60fps animations
  const playButtonScale = useSharedValue(1);
  const controlOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const visualizerScale = useSharedValue(0.9);
  const pulseAnimation = useSharedValue(0);
  const volumeSliderOpacity = useSharedValue(0);

  useEffect(() => {
    console.log('First useEffect - initializePlayer');
    initializePlayer();

    // Start entrance animations (safe for web)
    try {
      controlOpacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
      visualizerScale.value = withSpring(1, { damping: 12, stiffness: 100 });

      // Ambient pulse effect
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } catch (error) {
      console.error('Animation error:', error);
    }

    return () => {
      console.log('Cleanup - unloading audio');
      AudioService.unload();
      AudioService.stopSpeech();
    };
  }, []);

  useEffect(() => {
    console.log('Second useEffect - track changed:', track?.title, 'isLoading:', isLoading);
    if (track && isLoading) {
      loadAudio();
      checkForTTSScript();
    }
  }, [track]);

  const initializePlayer = async () => {
    console.log('initializePlayer called');
    console.log('paramTrackId:', paramTrackId);
    console.log('paramTrack:', paramTrack ? 'exists' : 'null');

    try {
      if (paramTrackId && !paramTrack) {
        console.log('Loading track by ID:', paramTrackId);
        const allTracks = [
          ...AudioService.getMeditationTracks(),
          ...AudioService.getSoundscapes(),
        ];
        console.log('Total tracks available:', allTracks.length);

        const foundTrack = allTracks.find(t => t.id === paramTrackId);
        console.log('Found track:', foundTrack ? foundTrack.title : 'NOT FOUND');

        if (!foundTrack) {
          console.error('Track not found with id:', paramTrackId);
          Alert.alert('Error', 'Meditation track not found');
          navigation.goBack();
          return;
        }

        console.log('Setting track:', foundTrack.title);
        setTrack(foundTrack);
        setDuration(foundTrack.duration * 1000);
      } else if (paramTrack) {
        console.log('Using paramTrack directly:', paramTrack.title);
        await loadAudio();
        checkForTTSScript();
      }
    } catch (error) {
      console.error('Error initializing player:', error);
      Alert.alert('Error', 'Failed to initialize meditation player');
      navigation.goBack();
    }
  };

  const checkForTTSScript = () => {
    if (!track) return;
    const script = MeditationScriptService.getScriptById(track.id);
    if (script) {
      console.log('TTS script available for:', track.id);
      setUseTTS(true);
    }
  };

  const loadAudio = async () => {
    if (!track) {
      console.error('loadAudio: No track available');
      return;
    }

    console.log('Loading audio for:', track.title);
    try {
      await AudioService.initialize();
      await AudioService.loadTrack(track, onPlaybackUpdate);
      console.log('Audio loaded successfully');
      setIsLoading(false);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', 'Unable to load meditation audio');
      navigation.goBack();
    }
  };

  const onPlaybackUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || duration);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        handleComplete();
      }
    }
  };

  const handlePlayPause = async () => {
    playButtonScale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1, { damping: 8 })
    );

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.play();
    }
  };

  const handleSeek = async (value: number) => {
    await AudioService.seekTo(value);
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    await AudioService.setVolume(newVolume);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleVolumeControl = () => {
    const newState = !showVolumeControl;
    setShowVolumeControl(newState);
    volumeSliderOpacity.value = withTiming(newState ? 1 : 0, { duration: 300 });

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePlayTTS = async () => {
    if (!track) return;

    const script = MeditationScriptService.getScriptById(track.id);
    if (!script) {
      Alert.alert('Script Not Available', 'This meditation does not have a guided script yet.');
      return;
    }

    if (isSpeaking) {
      AudioService.stopSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    if (isPlaying) {
      await AudioService.pause();
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await AudioService.speakTextPremium(script.script, undefined, {
        ...script.ttsOptions,
        onStart: () => setIsSpeaking(true),
        onDone: () => {
          setIsSpeaking(false);
          handleComplete();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          setIsSpeaking(false);
          Alert.alert('TTS Error', 'Could not play guided meditation. Try audio mode instead.');
        },
      });
    } catch (error) {
      console.error('Error starting TTS:', error);
      setIsSpeaking(false);
    }
  };

  const handleComplete = async () => {
    if (!track) return;

    const minutes = Math.round(track.duration / 60);
    await StorageService.incrementSession(minutes);

    const profile = await StorageService.getUserProfile();
    const totalSessions = profile?.stats.totalSessions || 0;
    const totalMinutes = profile?.stats.totalMinutes || 0;

    const journalPrompt = MeditationScriptService.getJournalPrompt(track.id);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      '✨ Session Complete',
      `Beautiful work, soul seeker!\n\nYou've completed ${totalSessions} sessions for a total of ${totalMinutes} minutes of soul connection.\n\n${journalPrompt}`,
      [
        { text: 'Done', style: 'cancel', onPress: () => navigation.goBack() },
        {
          text: 'Journal Now',
          onPress: () => navigation.navigate('Journal', {
            prompt: journalPrompt,
            meditationId: track.id,
          }),
        },
      ]
    );

    if (isRepeat && !isSpeaking) {
      await AudioService.stop();
      await AudioService.play();
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Animated styles - MUST be at top level (Rules of Hooks)
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlOpacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const visualizerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: visualizerScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.3, 0.6]);
    return { opacity };
  });

  const volumeSliderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: volumeSliderOpacity.value,
    transform: [
      { translateY: interpolate(volumeSliderOpacity.value, [0, 1], [-10, 0]) }
    ],
  }));

  console.log('Render check - isLoading:', isLoading, 'track:', track?.title);

  if (isLoading || !track) {
    console.log('Rendering loading state');
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <CosmicVisualizer isActive={true} size={200} />
          <Text style={styles.loadingText}>Preparing your soul journey...</Text>
          <Text style={styles.loadingSubtext}>Aligning frequencies with your consciousness</Text>
        </View>
      </GradientBackground>
    );
  }

  console.log('Rendering full player');
  const progress = duration > 0 ? position / duration : 0;

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with close button */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Cosmic Visualizer Section */}
        <Animated.View style={[styles.visualizerSection, visualizerAnimatedStyle]}>
          <Animated.View style={[styles.visualizerGlow, pulseAnimatedStyle]} />
          <CosmicVisualizer
            isActive={isPlaying || isSpeaking}
            frequency={track.frequency}
            size={Math.min(SCREEN_WIDTH - 80, 360)}
          />
        </Animated.View>

        {/* Track Information */}
        <Animated.View style={[styles.infoSection, controlsAnimatedStyle]}>
          <Text style={styles.title}>{track.title}</Text>
          {track.description && (
            <Text style={styles.description}>{track.description}</Text>
          )}

          <View style={styles.badgeContainer}>
            {track.frequency && (
              <View style={styles.badge}>
                <Ionicons name="radio-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.badgeText}>{track.frequency}</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>{Math.floor(track.duration / 60)} min</Text>
            </View>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View style={[styles.progressSection, controlsAnimatedStyle]}>
          <View style={styles.progressBar}>
            <TouchableOpacity
              style={styles.progressTrackTouchable}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const trackWidth = SCREEN_WIDTH - (SPACING.xl * 2);
                const seekProgress = Math.max(0, Math.min(1, locationX / trackWidth));
                handleSeek(seekProgress * duration);
              }}
              activeOpacity={1}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
              <View style={styles.progressTrack} />
            </TouchableOpacity>
            <View style={[styles.progressThumb, { left: `${progress * 100}%` }]}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.progressThumbGradient}
              />
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </Animated.View>

        {/* Main Playback Controls */}
        <Animated.View style={[styles.controls, controlsAnimatedStyle]}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleSeek(Math.max(0, position - 15000))}
            activeOpacity={0.7}
          >
            <Ionicons name="play-back" size={36} color={COLORS.text} />
            <Text style={styles.controlLabel}>15s</Text>
          </TouchableOpacity>

          <Animated.View style={playButtonAnimatedStyle}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.tertiary]}
                style={styles.playButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={56}
                  color={COLORS.white}
                  style={isPlaying ? {} : { marginLeft: 4 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleSeek(Math.min(duration, position + 15000))}
            activeOpacity={0.7}
          >
            <Ionicons name="play-forward" size={36} color={COLORS.text} />
            <Text style={styles.controlLabel}>15s</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Controls */}
        <Animated.View style={[styles.enhancedControls, controlsAnimatedStyle]}>
          {useTTS && (
            <TouchableOpacity
              style={[styles.enhancedButton, isSpeaking && styles.enhancedButtonActive]}
              onPress={handlePlayTTS}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSpeaking ? "mic" : "mic-outline"}
                size={22}
                color={isSpeaking ? COLORS.secondary : COLORS.text}
              />
              <Text style={[styles.enhancedButtonText, isSpeaking && styles.enhancedButtonTextActive]}>
                {isSpeaking ? 'Stop Guide' : 'Voice Guide'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.enhancedButton, isRepeat && styles.enhancedButtonActive]}
            onPress={() => {
              setIsRepeat(!isRepeat);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRepeat ? "repeat" : "repeat-outline"}
              size={22}
              color={isRepeat ? COLORS.secondary : COLORS.text}
            />
            <Text style={[styles.enhancedButtonText, isRepeat && styles.enhancedButtonTextActive]}>
              Repeat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.enhancedButton, showVolumeControl && styles.enhancedButtonActive]}
            onPress={toggleVolumeControl}
            activeOpacity={0.8}
          >
            <Ionicons
              name={volume > 0.5 ? "volume-high" : volume > 0 ? "volume-medium" : "volume-mute"}
              size={22}
              color={showVolumeControl ? COLORS.secondary : COLORS.text}
            />
            <Text style={[styles.enhancedButtonText, showVolumeControl && styles.enhancedButtonTextActive]}>
              Volume
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Volume Slider */}
        {showVolumeControl && (
          <Animated.View style={[styles.volumeSlider, volumeSliderAnimatedStyle]}>
            <Ionicons name="volume-low" size={20} color={COLORS.textSecondary} />
            <View style={styles.volumeTrack}>
              <TouchableOpacity
                style={styles.volumeTrackTouchable}
                onPress={(event) => {
                  const { locationX } = event.nativeEvent;
                  const trackWidth = SCREEN_WIDTH - 120;
                  const newVolume = Math.max(0, Math.min(1, locationX / trackWidth));
                  handleVolumeChange(newVolume);
                }}
                activeOpacity={1}
              >
                <View style={styles.volumeTrackBackground}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.volumeFill, { width: `${volume * 100}%` }]}
                  />
                </View>
              </TouchableOpacity>
              <View style={[styles.volumeThumb, { left: `${volume * 100}%` }]}>
                <View style={styles.volumeThumbInner} />
              </View>
            </View>
            <Ionicons name="volume-high" size={20} color={COLORS.textSecondary} />
          </Animated.View>
        )}

        {/* Guidance Section */}
        <Animated.View style={[styles.guidanceSection, controlsAnimatedStyle]}>
          <View style={styles.guidanceCard}>
            <Ionicons name="leaf" size={24} color={COLORS.secondary} />
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceTitle}>Meditation Guidance</Text>
              <Text style={styles.guidanceText}>
                Find a comfortable position. Close your eyes. Breathe deeply and allow your
                consciousness to expand beyond the physical realm. Let the frequencies guide
                you to higher dimensions of awareness.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {track.category.charAt(0).toUpperCase() + track.category.slice(1)}
          </Text>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: SIZES.font.lg,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizerSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
    position: 'relative',
  },
  visualizerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 1000,
    opacity: 0.2,
    transform: [{ scale: 1.2 }],
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface + '80',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  badgeText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  progressBar: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  progressTrackTouchable: {
    height: 40,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    position: 'absolute',
    width: '100%',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  progressThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    top: 10,
  },
  progressThumbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  timeText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xxl,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  controlButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  controlLabel: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexWrap: 'wrap',
  },
  enhancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface + '80',
    borderRadius: SIZES.radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  enhancedButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '20',
  },
  enhancedButtonText: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  enhancedButtonTextActive: {
    color: COLORS.secondary,
  },
  volumeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  volumeTrack: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  volumeTrackTouchable: {
    height: 40,
    justifyContent: 'center',
  },
  volumeTrackBackground: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
  },
  volumeThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    marginLeft: -9,
    top: 11,
  },
  volumeThumbInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  guidanceSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  guidanceCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surface + '60',
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  guidanceTextContainer: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: SIZES.font.md,
    color: COLORS.secondary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  guidanceText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + '20',
    borderRadius: SIZES.radius.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  categoryText: {
    fontSize: SIZES.font.xs,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default MeditationPlayerScreen;
