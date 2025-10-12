// AudioService.ts - Manages meditation audio playback and soundscapes
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import * as Speech from 'expo-speech';

export interface AudioTrack {
  id: string;
  title: string;
  duration: number; // in seconds
  isPremium: boolean;
  category: 'meditation' | 'soundscape' | 'affirmation' | 'guidance';
  frequency?: string; // e.g., '528 Hz'
  description?: string;
  uri: string; // local asset or bundled file
}

class AudioService {
  private sound: Sound | null = null;
  private currentTrack: AudioTrack | null = null;
  private playbackCallback: ((status: AVPlaybackStatus) => void) | null = null;

  // Initialize audio mode for the app
  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Load and prepare audio track
  async loadTrack(track: AudioTrack, onPlaybackUpdate?: (status: AVPlaybackStatus) => void): Promise<void> {
    try {
      // Unload previous track if exists
      if (this.sound) {
        await this.unload();
      }

      this.currentTrack = track;
      this.playbackCallback = onPlaybackUpdate || null;

      // Create new sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
    } catch (error) {
      console.error('Error loading track:', error);
      throw error;
    }
  }

  // Playback controls
  async play(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async unload(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentTrack = null;
      }
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }

  // Get current playback status
  async getStatus(): Promise<AVPlaybackStatus | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  // Private callback for playback updates
  private onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (this.playbackCallback) {
      this.playbackCallback(status);
    }
  }

  // Get bundled meditation tracks
  getMeditationTracks(): AudioTrack[] {
    return [
      {
        id: 'med_1',
        title: 'QHHT Induction & Soul Remembrance',
        duration: 600, // 10 minutes
        isPremium: false,
        category: 'meditation',
        description: 'Traditional QHHT countdown induction (10-1) followed by soul remembrance visualization. Connect with your eternal soul essence through Dolores Cannon\'s proven methodology.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      },
      {
        id: 'med_2',
        title: 'Quantum Field & Divine Source Connection',
        duration: 900, // 15 minutes
        isPremium: false,
        category: 'meditation',
        description: 'Journey through parallel realities and connect with divine source energy. Based on QHHT concepts of infinite consciousness and the quantum nature of reality.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
      },
      {
        id: 'med_3',
        title: 'QHHT Past Life Regression',
        duration: 1200, // 20 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Complete QHHT past life regression protocol: Life selection, full immersion, higher soul purpose insight, return to present with wisdom. Experience life between lives and soul lessons.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
      },
      {
        id: 'med_4',
        title: 'QHHT Higher Self / Subconscious Communication',
        duration: 900, // 15 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Connect directly with your higher self using QHHT protocol. Receive guidance, answers, and profound wisdom from the aspect of you that knows everything.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Placeholder
      },
      {
        id: 'med_5',
        title: 'QHHT Body Scanning & Theta Healing',
        duration: 1800, // 30 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Complete body scan protocol followed by theta state healing. Clear energy blockages, release trapped emotions, accelerate healing. Includes Council of Elders connection.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', // Placeholder
      },
      {
        id: 'med_6',
        title: 'QHHT Future Life Progression',
        duration: 1200, // 20 minutes
        isPremium: true,
        category: 'meditation',
        description: 'QHHT technique to view potential future timelines. Witness the consequences of current choices and align with your highest path. Soul purpose activation.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', // Placeholder
      },
      {
        id: 'med_7',
        title: 'QHHT Subconscious Healing Session',
        duration: 2100, // 35 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Extended QHHT-style session focusing on subconscious healing. Address physical, emotional, and spiritual issues at the deepest level where all healing begins.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', // Placeholder
      },
      {
        id: 'med_8',
        title: 'Meet Your Spirit Guide (QHHT Protocol)',
        duration: 1500, // 25 minutes
        isPremium: true,
        category: 'meditation',
        description: 'QHHT technique to connect with your personal spirit guides and guardian angels. Receive protection, guidance, and messages from your spiritual support team.',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', // Placeholder
      },
    ];
  }

  // Get bundled soundscapes
  getSoundscapes(): AudioTrack[] {
    return [
      {
        id: 'sound_1',
        title: 'Cosmic Silence',
        duration: 3600,
        isPremium: false,
        category: 'soundscape',
        frequency: '432 Hz',
        description: 'Gentle ambient tones tuned to the universe',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', // Placeholder
      },
      {
        id: 'sound_2',
        title: 'Solfeggio 528 Hz',
        duration: 3600,
        isPremium: true,
        category: 'soundscape',
        frequency: '528 Hz',
        description: 'The frequency of love and DNA repair',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', // Placeholder
      },
      {
        id: 'sound_3',
        title: 'Quantum Field',
        duration: 3600,
        isPremium: true,
        category: 'soundscape',
        description: 'Binaural beats for accessing infinite possibilities',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Placeholder
      },
    ];
  }

  // Recording functionality for custom affirmations
  private recording: Audio.Recording | null = null;

  async startRecording(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      this.recording = recording;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) return null;

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  isRecording(): boolean {
    return this.recording !== null;
  }

  // Text-to-speech functionality for voice guidance
  private isSpeaking = false;
  private currentSpeechCallback: ((speaking: boolean) => void) | null = null;

  async speakText(
    text: string,
    options: {
      voice?: string;
      language?: string;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onDone?: () => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<void> {
    try {
      console.log('AudioService.speakText called with text length:', text.length);

      // Set speaking state immediately
      this.isSpeaking = true;
      options.onStart?.();
      this.currentSpeechCallback?.(true);

      // Call Speech.speak directly like the working test
      Speech.speak(text, {
        language: options.language || 'en-US',
        pitch: options.pitch || 1.0,
        rate: options.rate || 0.8, // Slightly slower for meditation
        volume: 1.0, // Ensure full volume
        onDone: () => {
          console.log('Speech.speak onDone callback triggered');
          this.isSpeaking = false;
          options.onDone?.();
          this.currentSpeechCallback?.(false);
        },
        onStopped: () => {
          console.log('Speech.speak onStopped callback triggered');
          this.isSpeaking = false;
          this.currentSpeechCallback?.(false);
        },
        onError: (error: any) => {
          console.error('TTS onError callback:', error);
          this.isSpeaking = false;
          options.onError?.(error);
          this.currentSpeechCallback?.(false);
        },
      });

      console.log('Speech.speak called successfully');
    } catch (error) {
      console.error('Error speaking text:', error);
      this.isSpeaking = false;
      this.currentSpeechCallback?.(false);
      throw error;
    }
  }

  stopSpeech(): void {
    try {
      Speech.stop();
      this.isSpeaking = false;
      this.currentSpeechCallback?.(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  setSpeechCallback(callback: (speaking: boolean) => void): void {
    this.currentSpeechCallback = callback;
  }

  clearSpeechCallback(): void {
    this.currentSpeechCallback = null;
  }

  // Get available voices
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }
}

export default new AudioService();
