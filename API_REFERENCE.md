# SoulSync API Reference

Complete API documentation for all services, components, and utilities in the SoulSync application.

## Table of Contents

- [Services](#services)
  - [StorageService](#storageservice)
  - [AudioService](#audioservice)
  - [NotificationService](#notificationservice)
  - [MeditationScriptService](#meditationscriptservice)
  - [JournalExportService](#journalexportservice)
- [Type Definitions](#type-definitions)
- [Components](#components)
- [Constants](#constants)

---

## Services

### StorageService

Centralized local storage service for soul data persistence using AsyncStorage.

**Location:** `src/services/StorageService.ts`

#### User Profile Management

##### `getUserProfile(): Promise<UserProfile | null>`

Retrieves the current user profile from local storage.

**Returns:** User profile object or null if not found

**Example:**
```typescript
const profile = await StorageService.getUserProfile();
console.log(profile?.stats.totalSessions);
```

##### `saveUserProfile(profile: UserProfile): Promise<void>`

Saves user profile to local storage.

**Parameters:**
- `profile: UserProfile` - Complete user profile object

**Example:**
```typescript
await StorageService.saveUserProfile({
  id: 'user123',
  name: 'Soul Seeker',
  isPremium: true,
  onboardingCompleted: true,
  preferences: {
    language: 'en-US',
    theme: 'dark',
    reminderTime: '09:00',
    soundEnabled: true,
  },
  stats: {
    streak: 7,
    lastActiveDate: '2025-10-18',
    totalSessions: 42,
    totalMinutes: 630,
  },
});
```

##### `updateStreak(): Promise<void>`

Updates the user's daily practice streak. Automatically increments if last active was yesterday, resets to 1 if missed days.

**Example:**
```typescript
await StorageService.updateStreak();
```

##### `incrementSession(minutes: number): Promise<void>`

Increments total sessions and minutes. Also updates streak automatically.

**Parameters:**
- `minutes: number` - Duration of the completed session

**Example:**
```typescript
await StorageService.incrementSession(15); // After 15-minute meditation
```

#### Journal Management

##### `getJournalEntries(): Promise<JournalEntry[]>`

Retrieves all journal entries from local storage.

**Returns:** Array of journal entries, sorted by most recent first

**Example:**
```typescript
const entries = await StorageService.getJournalEntries();
console.log(`You have ${entries.length} journal entries`);
```

##### `saveJournalEntry(entry: JournalEntry): Promise<void>`

Saves or updates a journal entry. Updates if ID exists, creates new if not.

**Parameters:**
- `entry: JournalEntry` - Complete journal entry object

**Example:**
```typescript
await StorageService.saveJournalEntry({
  id: 'entry_' + Date.now(),
  date: new Date().toISOString(),
  title: 'Soul Insights',
  content: 'Today I connected with my higher self...',
  mood: 'peaceful',
  gratitude: ['health', 'abundance', 'love'],
  tags: ['meditation', 'qhht'],
});
```

##### `deleteJournalEntry(id: string): Promise<void>`

Deletes a journal entry by ID.

**Parameters:**
- `id: string` - Entry ID to delete

**Example:**
```typescript
await StorageService.deleteJournalEntry('entry_123456789');
```

#### Vision Board Management

##### `getVisionBoards(): Promise<VisionBoard[]>`

Retrieves all vision boards from local storage.

**Returns:** Array of vision boards

**Example:**
```typescript
const boards = await StorageService.getVisionBoards();
```

##### `saveVisionBoard(board: VisionBoard): Promise<void>`

Saves or updates a vision board.

**Parameters:**
- `board: VisionBoard` - Complete vision board object

**Example:**
```typescript
await StorageService.saveVisionBoard({
  id: 'board_' + Date.now(),
  title: 'Abundant Life',
  desire: 'I manifest financial freedom and creative abundance',
  images: ['file://path1.jpg', 'file://path2.jpg'],
  colors: ['#FFD700', '#4A90E2'],
  soundscape: 'cosmic',
  createdAt: new Date().toISOString(),
});
```

##### `deleteVisionBoard(id: string): Promise<void>`

Deletes a vision board by ID.

**Parameters:**
- `id: string` - Vision board ID to delete

#### Affirmation Management

##### `getAffirmations(): Promise<Affirmation[]>`

Retrieves all affirmations (defaults + custom).

**Returns:** Array of affirmations, custom ones first

**Example:**
```typescript
const affirmations = await StorageService.getAffirmations();
const customOnly = affirmations.filter(a => a.isCustom);
```

##### `saveAffirmation(affirmation: Affirmation): Promise<void>`

Saves or updates an affirmation.

**Parameters:**
- `affirmation: Affirmation` - Complete affirmation object

**Example:**
```typescript
await StorageService.saveAffirmation({
  id: 'aff_' + Date.now(),
  text: 'I am a powerful manifestor',
  audioUri: 'file://recording.m4a',
  category: 'manifestation',
  isCustom: true,
  createdAt: new Date().toISOString(),
});
```

#### Goals Management

##### `getGoals(): Promise<Goal[]>`

Retrieves all goals and action plans.

**Example:**
```typescript
const goals = await StorageService.getGoals();
const activeGoals = goals.filter(g => !g.completed);
```

##### `saveGoal(goal: Goal): Promise<void>`

Saves or updates a goal.

**Parameters:**
- `goal: Goal` - Complete goal object

**Example:**
```typescript
await StorageService.saveGoal({
  id: 'goal_' + Date.now(),
  title: 'Launch my business',
  description: 'Create online coaching practice',
  category: 'career',
  deadline: '2025-12-31',
  tasks: [
    { id: 'task_1', title: 'Register LLC', completed: false },
    { id: 'task_2', title: 'Build website', completed: true },
  ],
  visionBoardId: 'board_123',
  completed: false,
  createdAt: new Date().toISOString(),
});
```

##### `deleteGoal(id: string): Promise<void>`

Deletes a goal by ID.

#### Sacred Space Management

##### `getSacredSpace(): Promise<any>`

Retrieves sacred space configuration.

**Returns:** Sacred space configuration object

##### `saveSacredSpace(config: any): Promise<void>`

Saves sacred space configuration.

**Parameters:**
- `config: any` - Sacred space settings

#### Data Management

##### `clearAllData(): Promise<void>`

Clears all app data from storage. Use with caution.

**Example:**
```typescript
// In settings, after user confirmation
await StorageService.clearAllData();
```

---

### AudioService

Manages meditation audio playback, soundscapes, voice recording, and text-to-speech.

**Location:** `src/services/AudioService.ts`

#### Initialization

##### `initialize(): Promise<void>`

Initializes audio mode for the app. Call once on app startup.

**Example:**
```typescript
useEffect(() => {
  AudioService.initialize();
}, []);
```

#### Audio Playback

##### `loadTrack(track: AudioTrack, onPlaybackUpdate?: (status: AVPlaybackStatus) => void): Promise<void>`

Loads an audio track and prepares for playback. Unloads previous track automatically.

**Parameters:**
- `track: AudioTrack` - Audio track to load
- `onPlaybackUpdate?: function` - Optional callback for playback status updates

**Example:**
```typescript
const track = AudioService.getMeditationTracks()[0];
await AudioService.loadTrack(track, (status) => {
  if (status.isLoaded) {
    setPosition(status.positionMillis);
    setDuration(status.durationMillis);
  }
});
```

##### `play(): Promise<void>`

Starts or resumes playback.

**Example:**
```typescript
await AudioService.play();
```

##### `pause(): Promise<void>`

Pauses playback.

**Example:**
```typescript
await AudioService.pause();
```

##### `stop(): Promise<void>`

Stops playback and resets to beginning.

**Example:**
```typescript
await AudioService.stop();
```

##### `seekTo(positionMillis: number): Promise<void>`

Seeks to a specific position in the audio.

**Parameters:**
- `positionMillis: number` - Position in milliseconds

**Example:**
```typescript
// Seek to 1 minute
await AudioService.seekTo(60 * 1000);
```

##### `setVolume(volume: number): Promise<void>`

Sets playback volume (0.0 to 1.0).

**Parameters:**
- `volume: number` - Volume level (clamped between 0 and 1)

**Example:**
```typescript
await AudioService.setVolume(0.7); // 70% volume
```

##### `unload(): Promise<void>`

Unloads the current track and releases resources.

**Example:**
```typescript
useEffect(() => {
  return () => {
    AudioService.unload(); // Cleanup on unmount
  };
}, []);
```

##### `getStatus(): Promise<AVPlaybackStatus | null>`

Gets current playback status.

**Returns:** Playback status object or null

**Example:**
```typescript
const status = await AudioService.getStatus();
if (status?.isLoaded && status.isPlaying) {
  console.log('Playing at', status.positionMillis);
}
```

##### `getCurrentTrack(): AudioTrack | null`

Gets the currently loaded track.

**Returns:** Current track or null

**Example:**
```typescript
const track = AudioService.getCurrentTrack();
console.log(`Now playing: ${track?.title}`);
```

#### Track Libraries

##### `getMeditationTracks(): AudioTrack[]`

Gets all available QHHT meditation tracks.

**Returns:** Array of 8 meditation tracks (2 free, 6 premium)

**Example:**
```typescript
const tracks = AudioService.getMeditationTracks();
const freeTracks = tracks.filter(t => !t.isPremium);
```

##### `getSoundscapes(): AudioTrack[]`

Gets all available soundscapes and healing frequencies.

**Returns:** Array of 3 soundscapes

**Example:**
```typescript
const soundscapes = AudioService.getSoundscapes();
const hz528 = soundscapes.find(s => s.frequency === '528 Hz');
```

#### Voice Recording

##### `startRecording(): Promise<void>`

Starts voice recording for custom affirmations. Requests permissions if needed.

**Throws:** Error if permissions denied

**Example:**
```typescript
try {
  await AudioService.startRecording();
  setRecording(true);
} catch (error) {
  Alert.alert('Permission denied');
}
```

##### `stopRecording(): Promise<string | null>`

Stops recording and returns file URI.

**Returns:** File URI of recording or null

**Example:**
```typescript
const uri = await AudioService.stopRecording();
if (uri) {
  await StorageService.saveAffirmation({
    id: 'aff_' + Date.now(),
    text: affirmationText,
    audioUri: uri,
    category: 'custom',
    isCustom: true,
    createdAt: new Date().toISOString(),
  });
}
```

##### `isRecording(): boolean`

Checks if currently recording.

**Returns:** True if recording is in progress

**Example:**
```typescript
if (AudioService.isRecording()) {
  console.log('Recording in progress...');
}
```

#### Text-to-Speech

##### `speakText(text: string, options?: SpeakOptions): Promise<void>`

Speaks text using device TTS engine with meditation-optimized voice settings. Used for QHHT guided meditations.

**Parameters:**
- `text: string` - Text to speak
- `options?: object` - TTS options:
  - `language?: string` - Language code (default: 'en-US')
  - `pitch?: number` - Pitch (0.5 to 2.0, default: 0.88 - lower, soothing)
  - `rate?: number` - Speed (0.5 to 2.0, default: 0.65 - very slow, calming)
  - `onStart?: function` - Called when speech starts
  - `onDone?: function` - Called when speech completes
  - `onError?: function` - Called on error

**Default Meditation Settings:**
- **Pitch:** 0.88 (lower for soothing, warm tone)
- **Rate:** 0.65 (very slow, calming pace for meditation)
- **Volume:** 0.85 (gentle overlay over background music)

**Example:**
```typescript
await AudioService.speakText(
  'Welcome to your QHHT meditation journey...',
  {
    language: 'en-US',
    pitch: 0.88, // Lower, more soothing (default)
    rate: 0.65,  // Very slow, calming (default)
    onStart: () => setIsSpeaking(true),
    onDone: () => {
      setIsSpeaking(false);
      handleComplete();
    },
    onError: (error) => {
      console.error('TTS Error:', error);
      Alert.alert('Could not play guided meditation');
    },
  }
);
```

**Meditation Script-Specific Settings:**
```typescript
// QHHT Induction (extra slow)
rate: 0.65, pitch: 0.88

// Past Life Regression (slowest)
rate: 0.62, pitch: 0.87

// Higher Self Communication
rate: 0.66, pitch: 0.89

// Body Scan & Healing
rate: 0.64, pitch: 0.86
```

##### `stopSpeech(): void`

Stops current text-to-speech playback.

**Example:**
```typescript
AudioService.stopSpeech();
```

##### `isCurrentlySpeaking(): boolean`

Checks if TTS is currently active.

**Returns:** True if speaking

**Example:**
```typescript
if (AudioService.isCurrentlySpeaking()) {
  console.log('TTS in progress');
}
```

##### `setSpeechCallback(callback: (speaking: boolean) => void): void`

Sets a callback for speech state changes.

**Parameters:**
- `callback: function` - Callback function receiving speaking state

**Example:**
```typescript
AudioService.setSpeechCallback((speaking) => {
  setIsSpeaking(speaking);
});
```

##### `clearSpeechCallback(): void`

Removes speech state callback.

**Example:**
```typescript
useEffect(() => {
  return () => {
    AudioService.clearSpeechCallback();
  };
}, []);
```

##### `getAvailableVoices(): Promise<Voice[]>`

Gets list of available TTS voices on device.

**Returns:** Array of voice objects

**Example:**
```typescript
const voices = await AudioService.getAvailableVoices();
const englishVoices = voices.filter(v => v.language.startsWith('en'));
```

---

### NotificationService

Manages daily affirmations and meditation reminders using expo-notifications.

**Location:** `src/services/NotificationService.ts`

#### Permissions

##### `requestPermissions(): Promise<boolean>`

Requests notification permissions from user. Sets up Android channel if needed.

**Returns:** True if permissions granted

**Example:**
```typescript
const granted = await NotificationService.requestPermissions();
if (!granted) {
  Alert.alert('Enable notifications to receive daily affirmations');
}
```

#### Daily Affirmations

##### `scheduleDailyAffirmation(config: NotificationConfig): Promise<void>`

Schedules recurring daily affirmation notification.

**Parameters:**
- `config: NotificationConfig` - Configuration object:
  - `enabled: boolean` - Whether to enable notifications
  - `time: string` - Time in HH:MM format (e.g., '09:00')
  - `affirmationText?: string` - Custom text (uses random if not provided)

**Example:**
```typescript
await NotificationService.scheduleDailyAffirmation({
  enabled: true,
  time: '09:00',
  affirmationText: 'You are an eternal soul experiencing a temporary human journey',
});
```

##### `cancelDailyAffirmation(): Promise<void>`

Cancels the scheduled daily affirmation.

**Example:**
```typescript
await NotificationService.cancelDailyAffirmation();
```

#### Meditation Reminders

##### `scheduleMeditationReminder(timeInSeconds: number): Promise<void>`

Schedules a one-time reminder after meditation duration.

**Parameters:**
- `timeInSeconds: number` - Delay in seconds

**Example:**
```typescript
// Remind after 15-minute meditation
await NotificationService.scheduleMeditationReminder(15 * 60);
```

#### Immediate Notifications

##### `sendNotification(title: string, body: string): Promise<void>`

Sends an immediate notification.

**Parameters:**
- `title: string` - Notification title
- `body: string` - Notification body

**Example:**
```typescript
await NotificationService.sendNotification(
  '✨ Vision Board Complete',
  'Your manifestation has been saved to the quantum field'
);
```

#### Management

##### `getAllScheduledNotifications(): Promise<NotificationRequest[]>`

Gets all currently scheduled notifications.

**Returns:** Array of notification request objects

**Example:**
```typescript
const scheduled = await NotificationService.getAllScheduledNotifications();
console.log(`You have ${scheduled.length} scheduled notifications`);
```

##### `cancelAllNotifications(): Promise<void>`

Cancels all scheduled notifications.

**Example:**
```typescript
await NotificationService.cancelAllNotifications();
```

#### Event Listeners

##### `addNotificationResponseListener(callback: function): Subscription`

Adds listener for when user taps notification.

**Parameters:**
- `callback: function` - Callback receiving notification response

**Returns:** Subscription object (call `.remove()` to unsubscribe)

**Example:**
```typescript
useEffect(() => {
  const subscription = NotificationService.addNotificationResponseListener(
    (response) => {
      if (response.notification.request.content.data.type === 'daily_affirmation') {
        navigation.navigate('Affirm');
      }
    }
  );
  return () => subscription.remove();
}, []);
```

##### `addNotificationReceivedListener(callback: function): Subscription`

Adds listener for notifications received while app is in foreground.

**Parameters:**
- `callback: function` - Callback receiving notification object

**Returns:** Subscription object

**Example:**
```typescript
const subscription = NotificationService.addNotificationReceivedListener(
  (notification) => {
    console.log('Received:', notification.request.content.title);
  }
);
```

---

### MeditationScriptService

Provides QHHT meditation scripts with TTS narration settings.

**Location:** `src/services/MeditationScriptService.ts`

#### Script Retrieval

##### `getScriptById(scriptId: string): MeditationScript | null`

Gets a meditation script by ID.

**Parameters:**
- `scriptId: string` - Script ID (e.g., 'script_med_1')

**Returns:** Meditation script or null

**Example:**
```typescript
const script = MeditationScriptService.getScriptById('script_med_3');
if (script) {
  await AudioService.speakText(script.script, script.ttsOptions);
}
```

##### `getQHHTInductionScript(): MeditationScript`

Gets the QHHT Induction & Soul Remembrance script (10 min).

**Returns:** Meditation script object

##### `getQuantumFieldScript(): MeditationScript`

Gets the Quantum Field & Divine Source Connection script (15 min).

##### `getPastLifeRegressionScript(): MeditationScript`

Gets the QHHT Past Life Regression script (20 min).

##### `getHigherSelfScript(): MeditationScript`

Gets the QHHT Higher Self Communication script (15 min).

##### `getBodyScanningScript(): MeditationScript`

Gets the QHHT Body Scanning & Theta Healing script (30 min).

**Example:**
```typescript
const inductionScript = MeditationScriptService.getQHHTInductionScript();
console.log(`Duration: ${inductionScript.duration / 60} minutes`);
console.log(`TTS Rate: ${inductionScript.ttsOptions.rate}x`);
```

#### Journal Prompts

##### `getJournalPrompt(scriptId: string): string`

Gets post-meditation journal prompt for a specific script.

**Parameters:**
- `scriptId: string` - Script ID

**Returns:** Journal prompt text

**Example:**
```typescript
const prompt = MeditationScriptService.getJournalPrompt('script_med_3');
Alert.alert('Session Complete', prompt, [
  { text: 'Done', style: 'cancel' },
  { text: 'Journal Now', onPress: () => navigation.navigate('Journal', { prompt }) },
]);
```

---

### JournalExportService

Enables professional PDF export of journal entries.

**Location:** `src/services/JournalExportService.ts`

#### PDF Export

##### `exportToPDF(entries: JournalEntry[]): Promise<void>`

Exports journal entries to beautifully formatted PDF and opens share sheet.

**Parameters:**
- `entries: JournalEntry[]` - Array of journal entries to export

**Throws:** Error if export fails

**Example:**
```typescript
try {
  const entries = await StorageService.getJournalEntries();
  await JournalExportService.exportToPDF(entries);
  Alert.alert('Success!', 'Your soul journey has been exported as PDF.');
} catch (error) {
  Alert.alert('Export Failed', 'Could not export journal.');
}
```

#### Export Summary

##### `getExportSummary(entries: JournalEntry[]): string`

Gets a summary of what will be exported.

**Parameters:**
- `entries: JournalEntry[]` - Entries to summarize

**Returns:** Formatted summary string

**Example:**
```typescript
const summary = JournalExportService.getExportSummary(entries);
console.log(summary); // "📖 12 journal entries\n✍️ 3,847 words"

Alert.alert('Export Journal as PDF', summary, [
  { text: 'Cancel', style: 'cancel' },
  { text: 'Export', onPress: async () => {
    await JournalExportService.exportToPDF(entries);
  }},
]);
```

---

## Type Definitions

### UserProfile

```typescript
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  isPremium: boolean;
  onboardingCompleted: boolean;
  preferences: {
    language: string;
    theme: 'dark' | 'light';
    reminderTime: string;
    soundEnabled: boolean;
  };
  stats: {
    streak: number;
    lastActiveDate: string;
    totalSessions: number;
    totalMinutes: number;
  };
}
```

### JournalEntry

```typescript
interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  gratitude?: string[];
  tags?: string[];
}
```

### VisionBoard

```typescript
interface VisionBoard {
  id: string;
  title: string;
  desire: string;
  images: string[];
  colors: string[];
  soundscape?: string;
  createdAt: string;
  lastViewed?: string;
}
```

### Affirmation

```typescript
interface Affirmation {
  id: string;
  text: string;
  audioUri?: string;
  category: string;
  isCustom: boolean;
  createdAt: string;
}
```

### Goal

```typescript
interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline?: string;
  tasks: Task[];
  visionBoardId?: string;
  completed: boolean;
  createdAt: string;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}
```

### AudioTrack

```typescript
interface AudioTrack {
  id: string;
  title: string;
  duration: number; // in seconds
  isPremium: boolean;
  category: 'meditation' | 'soundscape' | 'affirmation' | 'guidance';
  frequency?: string; // e.g., '528 Hz', '432 Hz'
  description?: string;
  uri: string | number; // local asset (require() returns number) or URI string
}
```

**Audio Features:**
- **Layered Soundscapes:** Multiple harmonics (fundamental + 1.5x + 2x frequencies) for richness
- **Binaural Beats:** 5-6 Hz theta waves for deep meditation states
- **Tremolo Effects:** Gentle pulsing (0.1-0.25 Hz) creates evolving, non-monotonous soundscape
- **Brown Noise:** Warm ambient background (better than pink/white noise)
- **High Quality:** 192 kbps MP3, 44.1 kHz stereo

### MeditationScript

```typescript
interface MeditationScript {
  id: string;
  title: string;
  duration: number; // in seconds
  script: string; // Full narration text
  ttsOptions: {
    rate: number;    // 0.5 to 2.0
    pitch: number;   // 0.5 to 2.0
    language: string; // e.g., 'en-US'
  };
}
```

### NotificationConfig

```typescript
interface NotificationConfig {
  enabled: boolean;
  time: string; // HH:MM format
  affirmationText?: string;
}
```

---

## Components

### Button

**Location:** `src/components/Button.tsx`

Reusable button component with variants and icon support.

**Props:**
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  fullWidth?: boolean;
}
```

**Example:**
```tsx
<Button
  title="Start Meditation"
  onPress={() => navigation.navigate('MeditationPlayer', { track })}
  variant="primary"
  icon="play"
/>
```

### Card

**Location:** `src/components/Card.tsx`

Container component with cosmic styling.

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}
```

**Example:**
```tsx
<Card onPress={() => handleCardPress()}>
  <Text>Card Content</Text>
</Card>
```

### GradientBackground

**Location:** `src/components/GradientBackground.tsx`

Full-screen gradient background wrapper.

**Props:**
```typescript
interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
}
```

**Example:**
```tsx
<GradientBackground colors={[COLORS.background, COLORS.primary + '20']}>
  <View>{/* Screen content */}</View>
</GradientBackground>
```

### QHHTGuide

**Location:** `src/components/QHHTGuide.tsx`

Modal component providing QHHT methodology information.

**Props:**
```typescript
interface QHHTGuideProps {
  visible: boolean;
  onClose: () => void;
}
```

**Example:**
```tsx
<QHHTGuide
  visible={showGuide}
  onClose={() => setShowGuide(false)}
/>
```

---

## Constants

### Theme Colors

**Location:** `src/constants/theme.ts`

```typescript
export const COLORS = {
  primary: '#4A90E2',      // Serenity Blue
  secondary: '#FFD700',    // Soul Gold
  tertiary: '#9B59B6',     // Cosmic Purple
  accent: '#E91E63',       // Manifestation Pink
  background: '#0A0E27',   // Deep Space Navy
  surface: '#1A1F3A',      // Dark Surface
  text: '#E8EAF6',         // Light Text
  textSecondary: '#B0BEC5', // Muted Text
  white: '#FFFFFF',
  error: '#FF5252',
  success: '#4CAF50',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
};
```

**Usage:**
```typescript
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.secondary,
  },
});
```

---

## Error Handling

All service methods include try-catch error handling and log errors to console. In production, consider integrating error tracking services like Sentry.

**Example:**
```typescript
try {
  await StorageService.saveJournalEntry(entry);
  Alert.alert('Success', 'Journal entry saved');
} catch (error) {
  console.error('Error saving journal:', error);
  Alert.alert('Error', 'Could not save journal entry. Please try again.');
}
```

---

## Best Practices

### 1. Always Initialize Audio on Startup

```typescript
useEffect(() => {
  AudioService.initialize();
}, []);
```

### 2. Clean Up Resources

```typescript
useEffect(() => {
  return () => {
    AudioService.unload();
    AudioService.clearSpeechCallback();
  };
}, []);
```

### 3. Request Permissions Early

```typescript
useEffect(() => {
  NotificationService.requestPermissions();
}, []);
```

### 4. Use Unique IDs

```typescript
const newEntry: JournalEntry = {
  id: 'entry_' + Date.now(),
  // ...rest of entry
};
```

### 5. Handle Premium Status

```typescript
const profile = await StorageService.getUserProfile();
if (!profile?.isPremium && track.isPremium) {
  navigation.navigate('PremiumUpgrade');
  return;
}
```

### 6. Update Streaks on Activity

```typescript
// After completing meditation, journal entry, etc.
await StorageService.updateStreak();
```

---

## Questions & Support

For issues or feature requests, please visit:
[https://github.com/tom3k5/SoulSync/issues](https://github.com/tom3k5/SoulSync/issues)

**Remember: You are an eternal soul experiencing a temporary human journey.** 🌌
