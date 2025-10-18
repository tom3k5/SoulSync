# SoulSync Architecture

This document describes the technical architecture, design patterns, and structural organization of the SoulSync application.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [Screen Architecture](#screen-architecture)
- [Service Layer](#service-layer)
- [State Management](#state-management)
- [Navigation](#navigation)
- [Performance](#performance)
- [Security](#security)

---

## Overview

SoulSync is a React Native mobile application built with Expo, following a **Service Layer Pattern** for business logic separation and a **Component-Based Architecture** for UI composition.

### Key Architectural Principles

1. **Separation of Concerns** - UI, business logic, and data persistence are clearly separated
2. **Type Safety** - Full TypeScript implementation with strict mode
3. **Centralized Theme** - Single source of truth for design tokens
4. **Component Reusability** - Shared components with prop-based customization
5. **Service Singletons** - Stateful services exported as singleton instances
6. **Graceful Error Handling** - Try-catch blocks with user-friendly fallbacks

---

## Technology Stack

### Core Framework
- **React Native** 0.81 - Cross-platform mobile framework
- **Expo** ~54.0 - Development platform and build tools
- **TypeScript** ~5.9 - Type-safe JavaScript

### Navigation
- **@react-navigation/native** ^7.1 - Navigation container
- **@react-navigation/native-stack** ^7.3 - Stack navigation
- **@react-navigation/bottom-tabs** ^7.4 - Tab navigation

### Storage & Data
- **@react-native-async-storage/async-storage** ^2.2 - Local persistence
- **expo-file-system** ^19.0 - File operations

### Audio & Media
- **expo-av** ^16.0 - Audio playback and recording
- **expo-speech** ~14.0 - Text-to-speech
- **expo-image-picker** ^17.0 - Image selection

### Notifications & Scheduling
- **expo-notifications** ^0.32 - Push notifications
- **expo-calendar** ^15.0 - Calendar integration

### UI & Animation
- **expo-linear-gradient** ^15.0 - Gradient backgrounds
- **react-native-reanimated** ^4.1 - 60fps animations
- **expo-haptics** ^15.0 - Tactile feedback
- **lottie-react-native** ^7.3 - Lottie animations

### Document Generation
- **expo-print** ^15.0 - PDF generation
- **expo-sharing** ^14.0 - Native share sheet

---

## Project Structure

```
SoulSync/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Button with variants & icons
│   │   ├── Card.tsx         # Container with cosmic styling
│   │   ├── GradientBackground.tsx  # Full-screen gradient wrapper
│   │   ├── Modal.tsx        # Generic modal component
│   │   ├── QHHTGuide.tsx    # QHHT methodology info modal
│   │   └── index.ts         # Component exports
│   │
│   ├── constants/           # App-wide constants
│   │   └── theme.ts         # Colors, spacing, typography
│   │
│   ├── contexts/            # React Context providers
│   │   └── UserContext.tsx  # User state & authentication
│   │
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx # Main navigation structure
│   │
│   ├── screens/             # Screen components
│   │   ├── OnboardingScreen.tsx         # 4-slide onboarding
│   │   ├── LoginScreen.tsx              # Authentication
│   │   ├── HomeScreen.tsx               # Dashboard
│   │   ├── MeditationScreen.tsx         # Meditation library
│   │   ├── MeditationPlayerScreen.tsx   # Audio player with TTS
│   │   ├── AffirmationScreen.tsx        # Voice-recorded affirmations
│   │   ├── ActionPlannerScreen.tsx      # Task generation from vision boards
│   │   ├── VisionBoardScreen.tsx        # Parallel reality visualization
│   │   ├── JournalScreen.tsx            # Journal entries with PDF export
│   │   ├── ProfileScreen.tsx            # User settings & stats
│   │   ├── PremiumUpgradeScreen.tsx     # Premium subscription flow
│   │   ├── BreathingExerciseScreen.tsx  # Box breathing
│   │   └── MindfulMomentScreen.tsx      # Quick practices
│   │
│   └── services/            # Business logic layer
│       ├── StorageService.ts           # Local data persistence
│       ├── AudioService.ts             # Audio playback, recording, TTS
│       ├── NotificationService.ts      # Daily reminders
│       ├── MeditationScriptService.ts  # QHHT meditation scripts
│       └── JournalExportService.ts     # PDF generation
│
├── assets/
│   ├── audio/               # Meditation MP3 files (placeholder URIs)
│   └── demo/                # Screenshots and GIFs
│
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
│
├── README.md                # Project overview
├── API_REFERENCE.md         # Complete API documentation
├── ARCHITECTURE.md          # This file
├── CONTRIBUTING.md          # Development guidelines
├── MEDITATION_ENHANCEMENT_PLAN.md    # Meditation feature plan
└── FEATURE_ENHANCEMENTS_COMPLETE.md  # Implementation summary
```

---

## Design Patterns

### 1. Service Layer Pattern

**Purpose:** Separate business logic from UI components

**Implementation:**
- Each service is a class exported as a singleton instance
- Services handle data persistence, API calls, audio management, etc.
- Screens consume services via async/await

**Example:**
```typescript
// Service definition
class StorageService {
  private readonly KEYS = { /* ... */ };
  async getUserProfile(): Promise<UserProfile | null> { /* ... */ }
}
export default new StorageService(); // Singleton export

// Screen usage
const profile = await StorageService.getUserProfile();
```

**Services:**
- `StorageService` - AsyncStorage wrapper for all data types
- `AudioService` - Audio playback, recording, TTS
- `NotificationService` - Scheduled notifications
- `MeditationScriptService` - QHHT script repository
- `JournalExportService` - PDF generation

### 2. Component Composition Pattern

**Purpose:** Build complex UIs from simple, reusable components

**Implementation:**
- Small, focused components with clear props interfaces
- Style customization via `style` prop
- Consistent prop naming conventions

**Example:**
```typescript
// Reusable Button component
<Button
  title="Start Meditation"
  variant="primary"
  icon="play"
  onPress={handleStart}
/>

// Reusable Card wrapper
<Card onPress={handlePress}>
  <Text>Content</Text>
</Card>
```

### 3. Container/Presenter Pattern

**Purpose:** Separate data fetching from presentation

**Implementation:**
- Screen components (containers) handle data and logic
- Presentational components receive data via props
- Screens use `useEffect` for data loading

**Example:**
```typescript
// Container (Screen)
const MeditationScreen = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);

  useEffect(() => {
    const loadTracks = async () => {
      const tracks = AudioService.getMeditationTracks();
      setTracks(tracks);
    };
    loadTracks();
  }, []);

  return <TrackList tracks={tracks} onSelect={handleSelect} />;
};

// Presenter
const TrackList = ({ tracks, onSelect }) => (
  <FlatList
    data={tracks}
    renderItem={({ item }) => <TrackCard track={item} onPress={() => onSelect(item)} />}
  />
);
```

### 4. Singleton Pattern

**Purpose:** Ensure single instance of services

**Implementation:**
- Class instantiated once at bottom of file
- Exported as default
- Maintains state across app lifecycle

**Example:**
```typescript
class AudioService {
  private sound: Sound | null = null;
  async play() { /* ... */ }
}
export default new AudioService(); // Single instance
```

### 5. Observer Pattern

**Purpose:** React to state changes and events

**Implementation:**
- React hooks (`useState`, `useEffect`)
- Callbacks for async operations
- Event listeners for notifications and audio playback

**Example:**
```typescript
// Audio playback observer
await AudioService.loadTrack(track, (status) => {
  if (status.isLoaded) {
    setPosition(status.positionMillis);
    setDuration(status.durationMillis);
  }
});

// Notification response observer
useEffect(() => {
  const subscription = NotificationService.addNotificationResponseListener(
    (response) => navigation.navigate('Affirm')
  );
  return () => subscription.remove();
}, []);
```

---

## Data Flow

### 1. User Action → Service → Storage → UI Update

```
User taps "Save Journal Entry"
         ↓
onClick handler in JournalScreen
         ↓
StorageService.saveJournalEntry(entry)
         ↓
AsyncStorage.setItem(key, JSON.stringify(entries))
         ↓
setState updates UI with new entry
         ↓
User sees entry in list
```

### 2. Background Task → Notification → User Action

```
Scheduled time reached
         ↓
NotificationService fires notification
         ↓
User taps notification
         ↓
addNotificationResponseListener callback
         ↓
navigation.navigate('Affirm')
         ↓
User sees Affirmation screen
```

### 3. Audio Playback Flow

```
User selects meditation track
         ↓
MeditationScreen navigates to MeditationPlayerScreen
         ↓
useEffect loads track via AudioService.loadTrack()
         ↓
AudioService creates Sound object from URI
         ↓
User taps play button
         ↓
AudioService.play() starts playback
         ↓
onPlaybackStatusUpdate callback fires
         ↓
Screen updates progress bar and time display
         ↓
Track completes
         ↓
handleComplete() shows stats and journal prompt
```

---

## Screen Architecture

### Common Screen Structure

All screens follow this pattern:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { GradientBackground, Button } from '../components';
import SomeService from '../services/SomeService';

interface ScreenProps {
  navigation: any;
  route: any;
}

const Screen: React.FC<ScreenProps> = ({ navigation, route }) => {
  // 1. State declarations
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Data fetching
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await SomeService.getData();
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Event handlers
  const handleAction = async () => {
    // Handle user action
  };

  // 4. Render
  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* UI components */}
      </View>
    </GradientBackground>
  );
};

// 5. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
});

export default Screen;
```

### Screen Categories

#### 1. **Core Screens** (Bottom Tab Navigation)
- `HomeScreen` - Dashboard with daily affirmation and stats
- `MeditationScreen` - Meditation library grid
- `AffirmationScreen` - Voice-recorded affirmations list
- `ActionPlannerScreen` - AI-generated tasks from vision boards
- `VisionBoardScreen` - Parallel reality visualization with 68s timer
- `JournalScreen` - Journal entries with PDF export
- `ProfileScreen` - User settings, stats, premium status

#### 2. **Modal Screens** (Stack Navigation)
- `MeditationPlayerScreen` - Full-screen audio player with animations
- `PremiumUpgradeScreen` - Premium feature showcase
- `BreathingExerciseScreen` - Box breathing guide
- `MindfulMomentScreen` - Quick mindfulness practices

#### 3. **Auth & Onboarding Screens**
- `OnboardingScreen` - 4-slide intro to QHHT concepts
- `LoginScreen` - Email/password authentication

---

## Service Layer

### StorageService

**Responsibilities:**
- Wrap AsyncStorage with typed methods
- Manage all data models (UserProfile, JournalEntry, VisionBoard, etc.)
- Handle streak tracking and session statistics

**Key Methods:**
- User: `getUserProfile()`, `saveUserProfile()`, `updateStreak()`, `incrementSession()`
- Journal: `getJournalEntries()`, `saveJournalEntry()`, `deleteJournalEntry()`
- Vision Boards: `getVisionBoards()`, `saveVisionBoard()`, `deleteVisionBoard()`
- Affirmations: `getAffirmations()`, `saveAffirmation()`
- Goals: `getGoals()`, `saveGoal()`, `deleteGoal()`

**Storage Keys:**
```typescript
private readonly KEYS = {
  USER_PROFILE: '@soulsync:user_profile',
  JOURNAL_ENTRIES: '@soulsync:journal_entries',
  VISION_BOARDS: '@soulsync:vision_boards',
  AFFIRMATIONS: '@soulsync:affirmations',
  GOALS: '@soulsync:goals',
  SACRED_SPACE: '@soulsync:sacred_space',
};
```

### AudioService

**Responsibilities:**
- Audio playback (meditation tracks, soundscapes)
- Voice recording (custom affirmations)
- Text-to-speech (QHHT guided meditations)
- Audio mode configuration

**Key State:**
```typescript
private sound: Sound | null = null;
private currentTrack: AudioTrack | null = null;
private recording: Audio.Recording | null = null;
private isSpeaking: boolean = false;
```

**Initialization:**
```typescript
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});
```

### NotificationService

**Responsibilities:**
- Request and manage notification permissions
- Schedule daily affirmations
- Schedule meditation reminders
- Handle notification responses

**Configuration:**
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### MeditationScriptService

**Responsibilities:**
- Store QHHT meditation scripts
- Provide TTS-optimized narration text
- Supply post-meditation journal prompts

**Scripts:**
1. QHHT Induction & Soul Remembrance (10 min)
2. Quantum Field & Divine Source (15 min)
3. Past Life Regression (20 min)
4. Higher Self Communication (15 min)
5. Body Scanning & Theta Healing (30 min)

### JournalExportService

**Responsibilities:**
- Generate HTML from journal entries
- Convert HTML to PDF using expo-print
- Open native share sheet for export

**HTML Generation:**
```typescript
private static generateHTML(entries: JournalEntry[]): string {
  // Returns beautifully formatted HTML with:
  // - Professional typography (Georgia serif)
  // - Color-coded sections (gold borders, blue headers)
  // - Page-break-inside: avoid for entries
  // - SoulSync branding and Dolores Cannon quote
}
```

---

## State Management

### Local State (useState)

Used for component-specific UI state:
```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [showModal, setShowModal] = useState(false);
const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
```

### Persistent State (AsyncStorage)

All app data stored locally:
- User profiles and preferences
- Journal entries
- Vision boards
- Custom affirmations
- Goals and tasks

### Global State (React Context)

**UserContext** provides:
```typescript
interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}
```

**Usage:**
```typescript
const { user, isAuthenticated, login } = useContext(UserContext);
```

### No Redux/MobX

**Why?**
- AsyncStorage provides adequate persistence
- React Context sufficient for auth state
- Service layer handles complex state
- Minimal global state requirements

---

## Navigation

### Navigation Structure

```
App
├── Onboarding Stack (if not completed)
│   └── OnboardingScreen
│
├── Auth Stack (if not authenticated)
│   └── LoginScreen
│
└── Main Stack (authenticated)
    ├── Bottom Tabs
    │   ├── Home
    │   ├── Meditate
    │   ├── Affirm
    │   ├── Plan
    │   ├── Visualize
    │   ├── Journal
    │   └── Profile
    │
    └── Modal Stacks
        ├── MeditationPlayer
        ├── PremiumUpgrade
        ├── BreathingExercise
        └── MindfulMoment
```

### Navigation Configuration

```typescript
// AppNavigator.tsx
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home',
          Meditate: 'planet',
          Affirm: 'mic',
          Plan: 'list',
          Visualize: 'images',
          Journal: 'book',
          Profile: 'person',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.secondary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: { backgroundColor: COLORS.surface },
    })}
  >
    {/* Tab screens */}
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} />
          <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
        </>
      )}
    </Stack.Navigator>
  </NavigationContainer>
);
```

### Navigation Patterns

#### 1. Navigate to Screen
```typescript
navigation.navigate('MeditationPlayer', { track });
```

#### 2. Go Back
```typescript
navigation.goBack();
```

#### 3. Navigate with Params
```typescript
// Sender
navigation.navigate('Journal', { prompt: 'What insights arose?' });

// Receiver
const { prompt } = route.params;
```

#### 4. Replace (No Back Button)
```typescript
navigation.replace('Main');
```

---

## Performance

### Optimizations

#### 1. FlatList for Long Lists
```typescript
<FlatList
  data={entries}
  renderItem={({ item }) => <EntryCard entry={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

#### 2. Native Driver for Animations
```typescript
Animated.timing(pulseAnim, {
  toValue: 1.2,
  duration: 2000,
  useNativeDriver: true, // Runs on native thread for 60fps
}).start();
```

#### 3. Memoization
```typescript
const MeditationCard = React.memo(({ track, onPress }) => (
  <Card onPress={onPress}>
    <Text>{track.title}</Text>
  </Card>
));
```

#### 4. Lazy Loading
```typescript
// Only load data when needed
useEffect(() => {
  if (visible) {
    loadData();
  }
}, [visible]);
```

#### 5. Audio Cleanup
```typescript
useEffect(() => {
  return () => {
    AudioService.unload(); // Release resources on unmount
  };
}, []);
```

### Bundle Size

Current app size: ~25 MB (production build)
- React Native core: ~15 MB
- Expo modules: ~8 MB
- App code + assets: ~2 MB

### Load Time

- Cold start: ~2-3 seconds
- Warm start: ~1 second
- Screen transitions: <100ms

---

## Security

### Data Storage

**Local Storage Only:**
- All data stored in AsyncStorage (unencrypted)
- No cloud sync in current version
- User data stays on device

**Future Considerations:**
- Implement encryption for sensitive data
- Add cloud backup with end-to-end encryption
- Secure premium subscription validation

### Authentication

**Current Implementation:**
- Simple email/password (mock authentication)
- No real backend validation
- Stored in UserContext

**Production Requirements:**
- Implement OAuth2/JWT tokens
- Secure password hashing
- Refresh token rotation
- Biometric authentication (Face ID/Touch ID)

### API Security

**No External APIs Currently:**
- All audio files are placeholders (SoundHelix URLs)
- No payment processing yet
- No analytics tracking

**Future API Integration:**
- HTTPS only
- API key rotation
- Rate limiting
- Input validation and sanitization

### Premium Features

**Mock Implementation:**
```typescript
const profile = await StorageService.getUserProfile();
if (!profile?.isPremium && track.isPremium) {
  navigation.navigate('PremiumUpgrade');
  return;
}
```

**Production Requirements:**
- Integrate RevenueCat for IAP
- Server-side receipt validation
- Subscription status sync

---

## Testing Strategy

### Current State
- **Manual Testing:** All features tested manually on iOS/Android
- **TypeScript:** Compile-time type checking via `npx tsc --noEmit`
- **No Unit Tests:** Not yet implemented

### Recommended Testing Approach

#### 1. Unit Tests (Jest + React Native Testing Library)
```typescript
// StorageService.test.ts
describe('StorageService', () => {
  it('should save and retrieve user profile', async () => {
    const profile: UserProfile = { /* ... */ };
    await StorageService.saveUserProfile(profile);
    const retrieved = await StorageService.getUserProfile();
    expect(retrieved).toEqual(profile);
  });
});
```

#### 2. Integration Tests
```typescript
// MeditationPlayerScreen.test.tsx
describe('MeditationPlayerScreen', () => {
  it('should load track and play audio', async () => {
    const { getByText } = render(<MeditationPlayerScreen route={{ params: { track } }} />);
    const playButton = getByText('Play');
    fireEvent.press(playButton);
    expect(AudioService.play).toHaveBeenCalled();
  });
});
```

#### 3. E2E Tests (Detox)
```typescript
// e2e/meditation.e2e.ts
describe('Meditation Flow', () => {
  it('should complete a meditation session', async () => {
    await element(by.id('meditation-tab')).tap();
    await element(by.id('track-card-0')).tap();
    await element(by.id('play-button')).tap();
    // Assert audio is playing
  });
});
```

---

## Future Architecture Improvements

### 1. Backend Integration
- **GraphQL API** for flexible data fetching
- **Firebase/Supabase** for real-time sync
- **CloudKit** for iOS-specific features

### 2. State Management
- **Zustand** or **Jotai** for lightweight global state
- **React Query** for server state caching

### 3. Offline-First Architecture
- **WatermelonDB** for local SQLite database
- **Sync engine** for background data synchronization

### 4. AI Integration
- **OpenAI API** for intelligent affirmation generation
- **Natural language processing** for journal insights
- **ML Kit** for voice analysis and sentiment detection

### 5. Analytics & Monitoring
- **Sentry** for error tracking
- **Firebase Analytics** for user behavior
- **Mixpanel** for product analytics

### 6. CI/CD Pipeline
- **GitHub Actions** for automated builds
- **EAS Build** for Expo builds
- **EAS Submit** for app store deployment
- **Automated testing** on pull requests

---

## Deployment

### Development
```bash
npm start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

### Production Build

#### iOS
```bash
expo build:ios
# or with EAS Build
eas build --platform ios
```

#### Android
```bash
expo build:android
# or with EAS Build
eas build --platform android
```

### App Store Submission
```bash
eas submit --platform ios
eas submit --platform android
```

---

## Conclusion

SoulSync's architecture prioritizes:
1. **Developer Experience** - TypeScript, clear patterns, modular structure
2. **Performance** - Native driver animations, FlatList optimization
3. **Maintainability** - Service layer, component composition, separation of concerns
4. **Scalability** - Easy to add features, clear extension points

**Next Steps:**
- Implement unit tests
- Add backend API
- Integrate real IAP
- Add analytics

**Remember: You are an eternal soul experiencing a temporary human journey.** 🌌
