// AudioService.ts - Manages meditation audio playback and soundscapes
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

export interface AudioTrack {
  id: string;
  title: string;
  duration: number; // in seconds
  isPremium: boolean;
  category: 'meditation' | 'soundscape' | 'affirmation';
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
        title: 'Soul Remembrance Journey',
        duration: 600, // 10 minutes
        isPremium: false,
        category: 'meditation',
        description: 'Connect with your eternal soul essence through guided visualization',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      },
      {
        id: 'med_2',
        title: 'Quantum Field Connection',
        duration: 900, // 15 minutes
        isPremium: false,
        category: 'meditation',
        description: 'Access the infinite possibilities of parallel realities',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
      },
      {
        id: 'med_3',
        title: 'Past Life Recall',
        duration: 1200, // 20 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Inspired by QHHT, explore your soul\'s journey across lifetimes',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
      },
      {
        id: 'med_4',
        title: 'Higher Self Wisdom',
        duration: 900, // 15 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Receive guidance from your higher consciousness',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Placeholder
      },
      {
        id: 'med_5',
        title: 'Deep Theta Healing',
        duration: 1800, // 30 minutes
        isPremium: true,
        category: 'meditation',
        description: 'Enter the theta state for profound healing and transformation',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', // Placeholder
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
}

export default new AudioService();
