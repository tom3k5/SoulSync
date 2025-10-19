// MeditationPlayerScreen.tsx - Enhanced Soul Remembrance Meditation with Audio Player
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  interpolate,
  Easing,
} from 'react-native-reanimated';
import GradientBackground from '../components/GradientBackground';
import CosmicVisualizer from '../components/CosmicVisualizer';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import AudioService, { AudioTrack } from '../services/AudioService';
import StorageService from '../services/StorageService';
import MeditationScriptService from '../services/MeditationScriptService';

interface MeditationPlayerScreenProps {
  route: {
    params: {
      track?: AudioTrack;  // Optional for backwards compatibility
      trackId?: string;     // New: pass only ID
    };
  };
  navigation: any;
}

const MeditationPlayerScreen: React.FC<MeditationPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  // Support both old (track object) and new (trackId) approaches
  const paramTrack = route.params?.track;
  const paramTrackId = route.params?.trackId;

  console.log('=== MeditationPlayer: Component render ===');
  console.log('route.params:', route.params);
  console.log('paramTrack type:', typeof paramTrack, paramTrack);
  console.log('paramTrackId:', paramTrackId);

  const [track, setTrack] = useState<AudioTrack | null>(paramTrack || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(track?.duration ? track.duration * 1000 : 0);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [useTTS, setUseTTS] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reanimated shared values for buttery smooth 60fps animations
  const buttonScale = useSharedValue(1);
  const controlOpacity = useSharedValue(0);

  useEffect(() => {
    initializePlayer();

    return () => {
      AudioService.unload();
      AudioService.stopSpeech();
    };
  }, []);

  // Separate effect to load audio when track changes
  useEffect(() => {
    if (track && isLoading) {
      console.log('Track changed, loading audio for:', track.title);
      loadAudio();
      checkForTTSScript();
    }
  }, [track]);

  const initializePlayer = async () => {
    console.log('=== MeditationPlayer: initializePlayer called ===');
    console.log('paramTrackId:', paramTrackId);
    console.log('paramTrack:', paramTrack ? 'exists' : 'null');

    try {
      // If we have trackId but no track object, load it from AudioService
      if (paramTrackId && !paramTrack) {
        console.log('Loading track by ID:', paramTrackId);
        const allTracks = [
          ...AudioService.getMeditationTracks(),
          ...AudioService.getSoundscapes(),
        ];
        console.log('Total tracks available:', allTracks.length);
        const foundTrack = allTracks.find(t => t.id === paramTrackId);

        if (!foundTrack) {
          console.error('Track not found with id:', paramTrackId);
          Alert.alert('Error', 'Meditation track not found');
          navigation.goBack();
          return;
        }

        console.log('Track found:', foundTrack.title);
        setTrack(foundTrack);
        setDuration(foundTrack.duration * 1000);
        // Audio will be loaded by useEffect when track changes
      } else if (paramTrack) {
        console.log('Using paramTrack directly:', paramTrack.title);
        // Track already set in useState initialization
        // Load audio immediately for paramTrack case
        await loadAudio();
        checkForTTSScript();
      }

      // Fade in controls
      controlOpacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
      console.log('=== MeditationPlayer: initialization complete ===');
    } catch (error) {
      console.error('Error initializing player:', error);
      Alert.alert('Error', 'Failed to initialize meditation player');
      navigation.goBack();
    }
  };

  const checkForTTSScript = () => {
    if (!track) return;
    // Check if this track has a TTS script available
    const script = MeditationScriptService.getScriptById(track.id);
    if (script) {
      setUseTTS(true);
    }
  };

  const loadAudio = async () => {
    if (!track) {
      console.error('No track available to load');
      return;
    }

    try {
      await AudioService.initialize();
      await AudioService.loadTrack(track, onPlaybackUpdate);
      setIsLoading(false);
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
    // Smooth spring animation on button press
    buttonScale.value = withSpring(0.9, { damping: 10 }, () => {
      buttonScale.value = withSpring(1);
    });

    if (isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.play();
    }
  };

  const handleSeek = async (value: number) => {
    await AudioService.seekTo(value);
  };

  const handlePlayTTS = async () => {
    if (!track) return;

    const script = MeditationScriptService.getScriptById(track.id);
    if (!script) {
      Alert.alert('Script Not Available', 'This meditation does not have a guided script yet.');
      return;
    }

    setIsSpeaking(true);
    setIsPlaying(false); // Pause audio if playing

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

  const handleRateChange = async (rate: number) => {
    setPlaybackRate(rate);
    // Note: Implement rate change in AudioService if needed
  };

  const handleComplete = async () => {
    if (!track) return;

    const minutes = Math.round(track.duration / 60);
    await StorageService.incrementSession(minutes);

    const profile = await StorageService.getUserProfile();
    const totalSessions = profile?.stats.totalSessions || 0;
    const totalMinutes = profile?.stats.totalMinutes || 0;

    const journalPrompt = MeditationScriptService.getJournalPrompt(track.id);

    Alert.alert(
      '🌟 Session Complete',
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
      // Restart if repeat is enabled
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

  // Show loading while track is being loaded or audio is initializing
  if (isLoading || !track) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Preparing your soul journey...</Text>
        </View>
      </GradientBackground>
    );
  }

  const progress = duration > 0 ? position / duration : 0;

  // Animated styles
  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlOpacity.value,
  }));

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Animated.View style={[styles.header, controlsAnimatedStyle]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="close" size={32} color={COLORS.text} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.content}>
          {/* Replace old visualizer with new CosmicVisualizer */}
          <View style={styles.visualizer}>
            <CosmicVisualizer
              isActive={isPlaying || isSpeaking}
              frequency={track.frequency}
              size={320}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>{track.title}</Text>
            {track.description && (
              <Text style={styles.description}>{track.description}</Text>
            )}
            {track.frequency && (
              <View style={styles.badge}>
                <Ionicons name="analytics" size={16} color={COLORS.secondary} />
                <Text style={styles.badgeText}>{track.frequency}</Text>
              </View>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <TouchableOpacity
                style={styles.progressTrackTouchable}
                onPress={(event) => {
                  const { locationX } = event.nativeEvent;
                  const trackWidth = 300; // Approximate width, could be measured for precision
                  const seekProgress = Math.max(0, Math.min(1, locationX / trackWidth));
                  handleSeek(seekProgress * duration);
                }}
                activeOpacity={1}
              >
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.progressThumb, { left: `${progress * 100}%` }]}
                onPressIn={() => {}}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleSeek(Math.max(0, position - 15000))}
            >
              <Ionicons name="play-back" size={32} color={COLORS.text} />
              <Text style={styles.controlLabel}>15s</Text>
            </TouchableOpacity>

            <Animated.View style={playButtonAnimatedStyle}>
              <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.tertiary]}
                  style={styles.playButtonGradient}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={48}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleSeek(Math.min(duration, position + 15000))}
            >
              <Ionicons name="play-forward" size={32} color={COLORS.text} />
              <Text style={styles.controlLabel}>15s</Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Controls */}
          <View style={styles.enhancedControls}>
            {useTTS && (
              <TouchableOpacity
                style={[styles.enhancedButton, isSpeaking && styles.enhancedButtonActive]}
                onPress={isSpeaking ? () => AudioService.stopSpeech() : handlePlayTTS}
              >
                <Ionicons
                  name="mic"
                  size={20}
                  color={isSpeaking ? COLORS.secondary : COLORS.text}
                />
                <Text style={[styles.enhancedButtonText, isSpeaking && styles.enhancedButtonTextActive]}>
                  {isSpeaking ? 'Stop Guide' : 'Voice Guide'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.enhancedButton, isRepeat && styles.enhancedButtonActive]}
              onPress={() => setIsRepeat(!isRepeat)}
            >
              <Ionicons
                name="repeat"
                size={20}
                color={isRepeat ? COLORS.secondary : COLORS.text}
              />
              <Text style={[styles.enhancedButtonText, isRepeat && styles.enhancedButtonTextActive]}>
                Repeat
              </Text>
            </TouchableOpacity>

            <View style={styles.speedControl}>
              {[0.75, 1.0, 1.25].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.speedButton,
                    playbackRate === rate && styles.speedButtonActive,
                  ]}
                  onPress={() => handleRateChange(rate)}
                >
                  <Text
                    style={[
                      styles.speedButtonText,
                      playbackRate === rate && styles.speedButtonTextActive,
                    ]}
                  >
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.guidanceText}>
              <Ionicons name="leaf" size={20} color={COLORS.secondary} />
              <Text style={styles.guidance}>
                Find a comfortable position. Close your eyes. Breathe deeply and allow your
                consciousness to expand beyond the physical.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  loadingText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
  },
  visualizer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  visualizerGradient: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  soulIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 22,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius.full,
  },
  badgeText: {
    fontSize: SIZES.font.sm,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: SPACING.xl,
  },
  progressBar: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  progressTrackTouchable: {
    height: 40,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: -8,
    top: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  timeText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  controlButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  controlLabel: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  guidanceText: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surface + '80',
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
  },
  guidance: {
    flex: 1,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  enhancedControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  enhancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
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
  speedControl: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  speedButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  speedButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  speedButtonText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: COLORS.primary,
  },
});

export default MeditationPlayerScreen;
