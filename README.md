# SoulSync 🌌

**Manifest from Your Eternal Soul – Align, Visualize, Awaken**

A spiritual manifestation mobile app inspired by Dolores Cannon's Quantum Healing Hypnosis Technique (QHHT). Built with React Native and Expo to help users reconnect with their soul's essence, visualize parallel realities, and manifest their desires.

[![Run with Expo](https://img.shields.io/badge/Run%20with-Expo-4630EB?logo=expo&style=for-the-badge)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.82-61DAFB?logo=react&style=for-the-badge)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&style=for-the-badge)](https://react.dev)

## 🎬 Demo

![SoulSync Vision Board](https://raw.githubusercontent.com/tom3k5/SoulSync/main/assets/demo/vision-board-demo.gif)

*Visualize your desires in a parallel world with a 68-second focus timer. Share in issues to contribute your demo!*

## ✨ Features

### Implemented ✅

- **QHHT-Inspired Onboarding** - 4 beautiful slides introducing soul consciousness and quantum realities
- **Soul Remembrance Meditation** - 8 guided meditation tracks with authentic solfeggio frequencies
- **QHHT Meditation Scripts** - 5 complete guided meditation scripts with natural TTS narration
- **Layered Soundscapes** - Rich audio with binaural beats, harmonics, and ambient backgrounds
- **Solfeggio Frequencies** - 396 Hz, 417 Hz, 432 Hz, 528 Hz, 741 Hz for healing and transformation
- **Theta Brainwave Entrainment** - 5-6 Hz binaural beats for deep meditation states
- **Cosmic Meditation Player** - Masterpiece experience with pulsating visualizer (360px)
  - 60fps animations with react-native-reanimated
  - Frequency-based color mapping (528Hz gold/green, 432Hz cyan, etc.)
  - Multi-layer pulsing rings synchronized to healing frequencies
  - Gradient progress bars with interactive seeking
  - Volume control with animated slider
  - Large play button (96px) with spring animations
  - Haptic feedback on all interactions (iOS/Android)
  - Voice guide toggle for TTS narration
  - Repeat mode for continuous meditation
  - Session completion with stats and journal prompts
  - Scrollable layout for all screen sizes
  - Full audio playback with expo-av integration
- **Breathing Exercise** - Box breathing (4-7-8) with calming music and voice guidance
- **Parallel World Visualization** - Create vision boards with 68-second manifestation timer
- **Daily Affirmations** - 15 Dolores Cannon-inspired messages with notifications
- **Affirmation Weaver** - Record custom affirmations in your own voice with expo-av
- **Inspired Action Planner** - Auto-generate tasks from vision boards with calendar sync
- **Journal with PDF Export** - Beautiful PDF export with professional formatting and sharing
- **Session Stats** - Post-meditation completion stats and journal prompts
- **Premium Upgrade Screen** - Beautiful in-app subscription flow with feature showcase
- **Streak Tracking** - Monitor your daily practice and progress
- **Cosmic Theme** - Deep space design with soul gold and serenity blue colors
- **7 Bottom Tabs** - Home, Meditate, Affirm, Plan, Visualize, Journal, Profile

### Coming Soon 🚧

- Sacred Space customization
- Real in-app purchases (RevenueCat integration)
- Cloud backup sync
- AI-powered affirmation generation
- Lottie animations for affirmation recording

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on device
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'w' for web browser
# Scan QR code with Expo Go app on physical device

# Or run directly on web
npm run web
```

### Enable Onboarding (First Launch)

Edit `src/navigation/AppNavigator.tsx` line 104:

```typescript
const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false); // Changed from true
```

## 📱 App Structure

```
SoulSync/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Enhanced with icon & size props
│   │   ├── Card.tsx
│   │   ├── GradientBackground.tsx
│   │   └── QHHTGuide.tsx
│   ├── constants/           # Theme and config (cosmic colors)
│   ├── contexts/            # React Context (UserContext)
│   ├── navigation/          # Navigation setup (6 tabs + modals)
│   ├── screens/             # All app screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── MeditationJourneysScreen.tsx    # NEW - QHHT meditations
│   │   ├── SoundscapesScreen.tsx           # NEW - Healing frequencies
│   │   ├── BreathingExerciseScreen.tsx     # NOW TAB - Breathing exercises
│   │   ├── SoulToolsScreen.tsx             # NEW - Unified tool hub
│   │   ├── MeditationPlayerScreen.tsx
│   │   ├── AffirmationScreen.tsx
│   │   ├── ActionPlannerScreen.tsx
│   │   ├── VisionBoardScreen.tsx
│   │   ├── JournalScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── PremiumUpgradeScreen.tsx
│   └── services/            # Business logic
│       ├── StorageService.ts           # AsyncStorage wrapper
│       ├── AudioService.ts             # Audio playback/recording/TTS
│       ├── NotificationService.ts      # Daily reminders
│       ├── MeditationScriptService.ts  # QHHT meditation scripts
│       └── JournalExportService.ts     # PDF generation
├── assets/
│   ├── demo/                # Demo GIF for README
│   └── audio/               # Meditation tracks with layered soundscapes
│       ├── soul_remembrance.mp3        # 528 Hz + binaural beats
│       ├── quantum_field.mp3           # 432 Hz + theta waves
│       ├── past_life.mp3               # 417 Hz + harmonics
│       ├── higher_self.mp3             # 741 Hz + tremolo
│       ├── body_scan.mp3               # 528 Hz + 396 Hz
│       └── breathing_background.mp3    # 396 Hz + 594 Hz
├── README.md                # This file
├── API_REFERENCE.md         # Complete API documentation
├── ARCHITECTURE.md          # Architecture details
└── CONTRIBUTING.md          # Development guidelines
```

## 🎨 Theme Colors

```typescript
primary: '#4A90E2'      // Serenity Blue - Infinite consciousness
secondary: '#FFD700'    // Soul Gold - Eternal soul light
tertiary: '#9B59B6'     // Cosmic Purple
accent: '#E91E63'       // Manifestation Pink
background: '#0A0E27'   // Deep Space Navy
```

## 🎵 Audio Features

### Meditation Audio

All meditation tracks feature professionally designed soundscapes:

- **Layered Frequencies**: Multiple harmonics (fundamental + 1.5x + 2x) for richness
- **Binaural Beats**: 5-6 Hz theta waves for deep meditation states
- **Tremolo Effects**: Gentle pulsing creates evolving, non-monotonous soundscape
- **Brown Noise**: Warm ambient background (better than pink/white noise)
- **High Quality**: 192 kbps MP3, 44.1 kHz stereo

**Available Tracks:**
1. **Soul Remembrance** (528 Hz) - DNA repair frequency with rich harmonics
2. **Quantum Field** (432 Hz) - Universal harmony with 6 Hz theta binaural beats
3. **Past Life Regression** (417 Hz) - Facilitating change with 5 Hz theta beats
4. **Higher Self** (741 Hz) - Awakening intuition with 5.5 Hz theta beats
5. **Body Scan** (528 Hz + 396 Hz) - Healing + liberation dual frequencies

### Voice Guidance

Natural, calming TTS with meditation-optimized settings:

- **Slower Rate**: 0.62-0.68x speed for peaceful pacing
- **Lower Pitch**: 0.86-0.9 for soothing, warm tone
- **Gentle Volume**: 0.85 for soft overlay over music
- **Custom per Track**: Each meditation has optimal voice settings

### Breathing Exercise Audio

- **Calming Background**: 396 Hz + 594 Hz with brown noise
- **10-Minute Loop**: Seamless ambient soundscape
- **Phase Announcements**: Voice guidance for "Breathe In", "Hold", "Breathe Out"
- **Auto-sync**: Music and voice perfectly synchronized with animation

## 🔧 Key Services

### StorageService

Manages all local data with AsyncStorage:

```typescript
await StorageService.getUserProfile();
await StorageService.saveVisionBoard(board);
await StorageService.updateStreak();
await StorageService.incrementSession(minutes);
```

### AudioService

Handles meditation audio playback, recording, and TTS:

```typescript
// Audio playback
await AudioService.initialize();
await AudioService.loadTrack(track, onPlaybackUpdate);
await AudioService.play();
await AudioService.pause();
await AudioService.seekTo(positionMillis);

// Voice guidance (TTS)
await AudioService.speakText('Breathe In', {
  rate: 0.65,
  pitch: 0.88,
  language: 'en-US',
});
await AudioService.stopSpeech();

// Recording (affirmations)
await AudioService.startRecording();
const uri = await AudioService.stopRecording();
```

### NotificationService

Daily affirmations and reminders:

```typescript
await NotificationService.requestPermissions();
await NotificationService.scheduleDailyAffirmation({
  enabled: true,
  time: "09:00"
});
```

## 📦 Dependencies

- `expo` ~54.0.13 - React Native framework
- `@react-native-async-storage/async-storage` - Local storage
- `expo-av` - Audio playback & recording (affirmations)
- `expo-speech` - Text-to-speech for QHHT guided meditations
- `expo-print` - PDF generation for journal export
- `expo-file-system` - File operations
- `expo-sharing` - Native share sheet
- `expo-calendar` - Calendar sync for action planner
- `expo-notifications` - Push notifications
- `expo-image-picker` - Image selection
- `expo-linear-gradient` - Gradient UI
- `expo-haptics` - Tactile feedback
- `@react-navigation/native` - Navigation
- `@react-navigation/bottom-tabs` - Tab navigation
- `react-native-reanimated` - 60fps animations
- Plus 10 more supporting packages

## 🎯 Navigation

```
Onboarding (first launch)
  ↓
Login (if not authenticated)
  ↓
Main App (6 Bottom Tabs):
├── 🏠 Home - Daily affirmations & stats
├── 🪐 Journeys - QHHT meditation library (5 guided meditations)
├── 📻 Sounds - Healing frequencies & soundscapes
├── 💧 Breathe - Breathing exercises (4 patterns)
├── 📱 Tools - Soul toolkit hub:
│   ├── 📖 Journal - Entry writing & PDF export
│   ├── 🎤 Affirmations - Voice-recorded affirmations
│   ├── ✅ Action Planner - Task generation & calendar sync
│   └── 🌌 Vision Board - Parallel reality visualization
└── 👤 Profile - Settings & stats

Modals:
├── MeditationPlayer - Full-screen audio player with animations
├── PremiumUpgrade - Subscription flow
├── QHHTGuide - Learn about QHHT methodology
└── MindfulMoment - Quick practices
```

## 🧪 Testing

```bash
# TypeScript check
npx tsc --noEmit

# Run app with cache cleared
npm start -- --clear
```

## 📝 Common Tasks

### Add Real Audio Files

1. Place MP3s in `assets/audio/`
2. Update `src/services/AudioService.ts`:

```typescript
getMeditationTracks(): AudioTrack[] {
  return [{
    id: 'med_1',
    title: 'Soul Remembrance Journey',
    uri: require('../../assets/audio/soul_remembrance.mp3'), // Update this
    // ...
  }];
}
```

### Toggle Premium Status

In `src/services/StorageService.ts`:

```typescript
const profile: UserProfile = {
  isPremium: true, // Toggle this
  // ...
};
```

### Change Theme Colors

Edit `src/constants/theme.ts`:

```typescript
export const COLORS = {
  primary: '#4A90E2', // Change any color
  // ...
};
```

## 🐛 Troubleshooting

**Audio not playing?**
- Check URIs are valid (currently using placeholders)
- Test on physical device (simulators have audio issues)

**Voice guidance not working during meditation?**
- Ensure the meditation track has a corresponding script in `MeditationScriptService.ts`
- Track IDs must match script IDs (e.g., `script_qhht_induction`)
- Check console logs for TTS initialization errors
- Grant microphone permissions if needed

**Notifications not appearing?**
- Grant permissions during onboarding
- Check device notification settings

**Images not loading?**
- Grant camera roll permissions
- Test: `await ImagePicker.requestMediaLibraryPermissionsAsync()`

**App crashes?**
- Clear cache: `npm start -- --clear`
- Reinstall: `rm -rf node_modules && npm install`

**Web platform issues?**
- Install required dependencies: `npm install react-native-worklets react-native-worklets-core @lottiefiles/dotlottie-react babel-preset-expo --legacy-peer-deps`
- Ensure `babel.config.js` exists with proper configuration
- Run with cache cleared: `npm run clear -- --web`

**Meditation player showing blank screen?**
- This was caused by React Hooks violation (useAnimatedStyle after conditional return)
- Fixed by moving all hooks to top level of component
- Ensure trackId is passed via navigation (not full track object for web compatibility)
- Check browser console for "Rules of Hooks" errors
- See [MEDITATION_PLAYER_GUIDE.md](MEDITATION_PLAYER_GUIDE.md) for details

## 🎓 Architecture

- **Service Layer Pattern** - Business logic separated from UI
- **TypeScript** - Full type safety with strict mode
- **Centralized Theme** - Single source of truth for design
- **Component Composition** - Reusable UI components
- **Error Handling** - Graceful async operation handling

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🌟 Spiritual Design

This app uses soul-centered language throughout:
- Error messages: "Realign your energy and try again"
- Code comments referencing quantum fields
- UI emphasizing cosmic aesthetics
- Features designed for introspection

## 📊 Progress

**~95% Core Features Complete**

✅ Services, layered audio with binaural beats, meditation with optimized TTS, animated player, breathing exercises, affirmations, action planner, vision boards, journal PDF export, onboarding, premium UI, reorganized navigation
🚧 Real IAP integration, cloud sync, unit tests, Lottie animations

## 📚 Documentation

- **[README.md](README.md)** - Project overview (this file)
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation for all services
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed architecture and design patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines and contribution process
- **[SUBAGENTS_GUIDE.md](SUBAGENTS_GUIDE.md)** - AI subagent team guide for development
- **[NAVIGATION_GUIDE.md](NAVIGATION_GUIDE.md)** - World-class navigation system guide
- **[MEDITATION_PLAYER_GUIDE.md](MEDITATION_PLAYER_GUIDE.md)** - Complete meditation player documentation
- **[MEDITATION_ENHANCEMENT_PLAN.md](MEDITATION_ENHANCEMENT_PLAN.md)** - Meditation feature planning
- **[FEATURE_ENHANCEMENTS_COMPLETE.md](FEATURE_ENHANCEMENTS_COMPLETE.md)** - Implementation summary

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

**Quick Start for Contributors:**
```bash
git clone https://github.com/YOUR_USERNAME/SoulSync.git
cd SoulSync
npm install
npm start
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development workflow, coding standards, and commit conventions.

## 🙏 Credits

- **Inspiration**: Dolores Cannon's QHHT methodology
- **Framework**: React Native, Expo
- **Icons**: @expo/vector-icons (Ionicons)
- **Contributors**: All souls who have contributed to this journey

## 📄 License

MIT License - Built with love and cosmic consciousness ✨

---

**Remember: You are an eternal soul experiencing a temporary human journey. This app helps you remember who you truly are.** 🌌
