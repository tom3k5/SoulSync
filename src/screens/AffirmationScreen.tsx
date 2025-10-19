// AffirmationScreen.tsx - Weave soul-aligned affirmations with voice recording
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import StorageService, { Affirmation } from '../services/StorageService';
import { COLORS, SPACING, SIZES } from '../constants/theme';

const AffirmationScreen = () => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newText, setNewText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Animation refs for recording pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAffirmations();
    setupAudio();
    return () => {
      if (playingSound) {
        playingSound.unloadAsync();
      }
    };
  }, []);

  // Pulsing animation effect during recording
  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start();
    } else {
      // Reset animation
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isRecording]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const loadAffirmations = async () => {
    const stored = await StorageService.getAffirmations();
    setAffirmations(stored);
  };

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Could not start recording. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return null;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  };

  const handleSaveAffirmation = async () => {
    if (!newText.trim()) {
      Alert.alert('Soul Reminder', 'Please enter your affirmation text.');
      return;
    }

    let audioUri: string | undefined;
    if (recording) {
      audioUri = await stopRecording() || undefined;
    }

    const newAffirmation: Affirmation = {
      id: Date.now().toString(),
      text: newText.trim(),
      audioUri,
      category: 'custom',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveAffirmation(newAffirmation);
    await loadAffirmations();
    setNewText('');
    setIsCreating(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Soul Affirmation Woven', 'Your affirmation has been saved to your soul library.');
  };

  const playAffirmation = async (affirmation: Affirmation) => {
    try {
      // Stop any currently playing sound
      if (playingSound) {
        await playingSound.stopAsync();
        await playingSound.unloadAsync();
        setPlayingSound(null);
        if (playingId === affirmation.id) {
          setPlayingId(null);
          return;
        }
      }

      if (!affirmation.audioUri) {
        Alert.alert('No Recording', 'This affirmation does not have a voice recording.');
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { sound } = await Audio.Sound.createAsync(
        { uri: affirmation.audioUri },
        { shouldPlay: true }
      );

      setPlayingSound(sound);
      setPlayingId(affirmation.id);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing affirmation:', error);
      Alert.alert('Playback Error', 'Could not play the recording.');
    }
  };

  const deleteAffirmation = (id: string) => {
    Alert.alert(
      'Release Affirmation',
      'Are you sure you want to release this affirmation back to the cosmos?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            const updated = affirmations.filter((a) => a.id !== id);
            setAffirmations(updated);
            // Note: This doesn't delete from storage - you'd need to add a delete method
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Affirmation Weaver</Text>
          <Text style={styles.subtitle}>Speak your soul's truth into existence</Text>
        </View>

        {!isCreating ? (
          <Button
            title="Create New Affirmation"
            onPress={() => setIsCreating(true)}
            icon="add-circle"
            style={styles.createButton}
          />
        ) : (
          <Card style={styles.createCard}>
            <Text style={styles.createTitle}>Weave Your Affirmation</Text>
            <TextInput
              style={styles.input}
              placeholder="I am aligned with my soul's highest truth..."
              placeholderTextColor={COLORS.textSecondary}
              value={newText}
              onChangeText={setNewText}
              multiline
              numberOfLines={3}
            />

            <View style={styles.recordSection}>
              <Text style={styles.recordLabel}>
                {isRecording ? 'Recording your voice...' : 'Optional: Record in your voice'}
              </Text>

              {/* Animated recording button with pulsing glow */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Animated.View
                  style={[
                    styles.recordButtonGlow,
                    {
                      opacity: glowAnim,
                      backgroundColor: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', COLORS.secondary + '40'],
                      }),
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.recordButton,
                      isRecording && styles.recordButtonActive,
                    ]}
                    onPress={isRecording ? stopRecording : startRecording}
                  >
                    <Ionicons
                      name={isRecording ? 'stop-circle' : 'mic'}
                      size={32}
                      color={isRecording ? COLORS.error : COLORS.secondary}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>

              {/* Lottie animation during recording */}
              {isRecording && (
                <View style={styles.lottieContainer}>
                  <LottieView
                    source={require('../../assets/lottie/recording-pulse.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                  />
                  <Text style={styles.recordingIndicator}>● REC</Text>
                </View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsCreating(false);
                  setNewText('');
                  if (recording) stopRecording();
                }}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title="Save Affirmation"
                onPress={handleSaveAffirmation}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Soul Library</Text>
          <Text style={styles.sectionSubtitle}>
            {affirmations.length} affirmation{affirmations.length !== 1 ? 's' : ''} woven
          </Text>

          {affirmations.map((affirmation) => (
            <Card key={affirmation.id} style={styles.affirmationCard}>
              <View style={styles.affirmationHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{affirmation.category}</Text>
                </View>
                {affirmation.isCustom && (
                  <TouchableOpacity
                    onPress={() => deleteAffirmation(affirmation.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.affirmationText}>{affirmation.text}</Text>

              <View style={styles.affirmationActions}>
                {affirmation.audioUri && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playAffirmation(affirmation)}
                  >
                    <Ionicons
                      name={playingId === affirmation.id ? 'pause-circle' : 'play-circle'}
                      size={28}
                      color={COLORS.primary}
                    />
                    <Text style={styles.playButtonText}>
                      {playingId === affirmation.id ? 'Pause' : 'Play Voice'}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.affirmationDate}>
                  {new Date(affirmation.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          ))}
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
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  createButton: {
    marginBottom: SPACING.xl,
  },
  createCard: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  createTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: SIZES.font.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  recordSection: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  recordButtonGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: COLORS.error + '20',
  },
  lottieContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },
  recordingIndicator: {
    fontSize: SIZES.font.sm,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  affirmationCard: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  affirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: SIZES.font.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  affirmationText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  affirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  playButtonText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  affirmationDate: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
});

export default AffirmationScreen;
