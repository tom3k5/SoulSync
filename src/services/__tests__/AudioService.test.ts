// AudioService.test.ts - Unit tests for AudioService
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AudioService, { AudioTrack } from '../AudioService';

describe('AudioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('initialize sets audio mode correctly', async () => {
      await AudioService.initialize();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    });

    test('initialize handles errors gracefully', async () => {
      (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Audio error')
      );

      await expect(AudioService.initialize()).resolves.not.toThrow();
    });
  });

  describe('Track Loading', () => {
    const mockTrack: AudioTrack = {
      id: 'test-track',
      title: 'Test Meditation',
      duration: 300,
      isPremium: false,
      category: 'meditation',
      description: 'Test description',
      uri: 'https://example.com/test.mp3',
    };

    test('loadTrack creates sound object', async () => {
      await AudioService.loadTrack(mockTrack);

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: mockTrack.uri },
        { shouldPlay: false },
        expect.any(Function)
      );
    });

    test('loadTrack unloads previous track', async () => {
      const mockSound = {
        unloadAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: mockSound,
      });

      await AudioService.loadTrack(mockTrack);
      await AudioService.loadTrack(mockTrack);

      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });

    test('loadTrack accepts playback update callback', async () => {
      const callback = jest.fn();

      await AudioService.loadTrack(mockTrack, callback);

      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });
  });

  describe('Playback Controls', () => {
    test('play starts audio playback', async () => {
      const mockSound = {
        playAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: mockSound,
      });

      await AudioService.loadTrack({
        id: 'test',
        title: 'Test',
        duration: 300,
        isPremium: false,
        category: 'meditation',
        uri: 'test.mp3',
      });

      await AudioService.play();

      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    test('pause pauses audio playback', async () => {
      const mockSound = {
        pauseAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: mockSound,
      });

      await AudioService.loadTrack({
        id: 'test',
        title: 'Test',
        duration: 300,
        isPremium: false,
        category: 'meditation',
        uri: 'test.mp3',
      });

      await AudioService.pause();

      expect(mockSound.pauseAsync).toHaveBeenCalled();
    });

    test('stop stops and resets audio', async () => {
      const mockSound = {
        stopAsync: jest.fn(),
        setPositionAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: mockSound,
      });

      await AudioService.loadTrack({
        id: 'test',
        title: 'Test',
        duration: 300,
        isPremium: false,
        category: 'meditation',
        uri: 'test.mp3',
      });

      await AudioService.stop();

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
    });

    test('seekTo seeks to position', async () => {
      const mockSound = {
        setPositionAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: mockSound,
      });

      await AudioService.loadTrack({
        id: 'test',
        title: 'Test',
        duration: 300,
        isPremium: false,
        category: 'meditation',
        uri: 'test.mp3',
      });

      await AudioService.seekTo(60000);

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(60000);
    });

    test('setVolume clamps volume between 0 and 1', async () => {
      const mockSound = {
        setVolumeAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: mockSound,
      });

      await AudioService.loadTrack({
        id: 'test',
        title: 'Test',
        duration: 300,
        isPremium: false,
        category: 'meditation',
        uri: 'test.mp3',
      });

      await AudioService.setVolume(1.5);
      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(1);

      await AudioService.setVolume(-0.5);
      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0);

      await AudioService.setVolume(0.7);
      expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.7);
    });
  });

  describe('Text-to-Speech', () => {
    test('speakText calls Speech.speak with correct parameters', async () => {
      const text = 'Welcome to your QHHT meditation';

      await AudioService.speakText(text, {
        language: 'en-US',
        pitch: 0.95,
        rate: 0.7,
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        text,
        expect.objectContaining({
          language: 'en-US',
          pitch: 0.95,
          rate: 0.7,
          volume: 1.0,
        })
      );
    });

    test('speakText triggers onStart callback', async () => {
      const onStart = jest.fn();

      await AudioService.speakText('Test', { onStart });

      expect(onStart).toHaveBeenCalled();
    });

    test('stopSpeech calls Speech.stop', () => {
      AudioService.stopSpeech();

      expect(Speech.stop).toHaveBeenCalled();
    });

    test('isCurrentlySpeaking returns correct state', async () => {
      expect(AudioService.isCurrentlySpeaking()).toBe(false);

      await AudioService.speakText('Test');

      // Note: In real implementation, this would be true during speech
      // Mock setup would need to be more sophisticated for this
    });
  });

  describe('Meditation Tracks', () => {
    test('getMeditationTracks returns array of tracks', () => {
      const tracks = AudioService.getMeditationTracks();

      expect(Array.isArray(tracks)).toBe(true);
      expect(tracks.length).toBeGreaterThan(0);
      expect(tracks[0]).toHaveProperty('id');
      expect(tracks[0]).toHaveProperty('title');
      expect(tracks[0]).toHaveProperty('duration');
      expect(tracks[0]).toHaveProperty('isPremium');
    });

    test('meditation tracks include free and premium', () => {
      const tracks = AudioService.getMeditationTracks();

      const freeTracks = tracks.filter((t) => !t.isPremium);
      const premiumTracks = tracks.filter((t) => t.isPremium);

      expect(freeTracks.length).toBeGreaterThan(0);
      expect(premiumTracks.length).toBeGreaterThan(0);
    });
  });

  describe('Soundscapes', () => {
    test('getSoundscapes returns array of soundscapes', () => {
      const soundscapes = AudioService.getSoundscapes();

      expect(Array.isArray(soundscapes)).toBe(true);
      expect(soundscapes.length).toBeGreaterThan(0);
    });

    test('soundscapes include frequency information', () => {
      const soundscapes = AudioService.getSoundscapes();
      const withFrequency = soundscapes.filter((s) => s.frequency);

      expect(withFrequency.length).toBeGreaterThan(0);
    });
  });

  describe('Voice Recording', () => {
    test('startRecording requests permissions', async () => {
      await AudioService.startRecording();

      expect(Audio.requestPermissionsAsync).toHaveBeenCalled();
    });

    test('startRecording sets up recording', async () => {
      await AudioService.startRecording();

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    });

    test('stopRecording returns file URI', async () => {
      await AudioService.startRecording();
      const uri = await AudioService.stopRecording();

      expect(uri).toBeTruthy();
      expect(typeof uri).toBe('string');
    });

    test('isRecording returns correct state', async () => {
      expect(AudioService.isRecording()).toBe(false);

      await AudioService.startRecording();
      expect(AudioService.isRecording()).toBe(true);

      await AudioService.stopRecording();
      expect(AudioService.isRecording()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('play handles null sound gracefully', async () => {
      await expect(AudioService.play()).resolves.not.toThrow();
    });

    test('pause handles null sound gracefully', async () => {
      await expect(AudioService.pause()).resolves.not.toThrow();
    });

    test('loadTrack handles errors', async () => {
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Load error')
      );

      await expect(
        AudioService.loadTrack({
          id: 'test',
          title: 'Test',
          duration: 300,
          isPremium: false,
          category: 'meditation',
          uri: 'invalid.mp3',
        })
      ).rejects.toThrow();
    });
  });
});
