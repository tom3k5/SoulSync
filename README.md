# SoulSync 🌌

**Manifest from Your Eternal Soul – Align, Visualize, Awaken**

A spiritual manifestation mobile app inspired by Dolores Cannon's Quantum Healing Hypnosis Technique (QHHT). Built with React Native and Expo to help users reconnect with their soul's essence, visualize parallel realities, and manifest their desires.

[![Run with Expo](https://img.shields.io/badge/Run%20with-Expo-4630EB?logo=expo&style=for-the-badge)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&style=for-the-badge)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org)

## 🎬 Demo

![SoulSync Vision Board](https://raw.githubusercontent.com/tom3k5/SoulSync/main/assets/demo/vision-board-demo.gif)

*Visualize your desires in a parallel world with a 68-second focus timer. Share in issues to contribute your demo!*

## ✨ Features

### Implemented ✅

- **QHHT-Inspired Onboarding** - 4 beautiful slides introducing soul consciousness and quantum realities
- **Soul Remembrance Meditation** - 8 guided meditation tracks with full audio player
- **QHHT Meditation Scripts** - 5 complete guided meditation scripts with TTS narration
- **Animated Meditation Player** - Pulsing visualizer with 60fps native animations
- **Playback Controls** - Speed controls (0.75x, 1.0x, 1.25x), repeat/loop, TTS voice guidance
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
│   │   ├── MeditationScreen.tsx
│   │   ├── MeditationPlayerScreen.tsx
│   │   ├── AffirmationScreen.tsx       # NEW - Voice recording
│   │   ├── ActionPlannerScreen.tsx     # NEW - Task generation
│   │   ├── VisionBoardScreen.tsx
│   │   ├── JournalScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── PremiumUpgradeScreen.tsx    # NEW - IAP flow
│   └── services/            # Business logic
│       ├── StorageService.ts           # AsyncStorage wrapper
│       ├── AudioService.ts             # Audio playback/recording/TTS
│       ├── NotificationService.ts      # Daily reminders
│       ├── MeditationScriptService.ts  # QHHT meditation scripts
│       └── JournalExportService.ts     # PDF generation
├── assets/
│   ├── demo/                # Demo GIF for README
│   └── audio/               # Meditation tracks
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

Handles meditation audio playback:

```typescript
await AudioService.initialize();
await AudioService.loadTrack(track, onPlaybackUpdate);
await AudioService.play();
await AudioService.pause();
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
Main App (Bottom Tabs):
├── Home - Daily affirmations & stats
├── Meditate - Meditation library & player (QHHT Guide modal)
├── Affirm - Voice-recorded affirmations (NEW)
├── Plan - Action planner with calendar sync (NEW)
├── Visualize - Vision board creator
├── Journal - Entry writing
└── Profile - Settings & stats

Modals:
├── MeditationPlayer - Full-screen audio player
├── PremiumUpgrade - Subscription flow (NEW)
├── BreathingExercise - Box breathing
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

**~92% Core Features Complete**

✅ Services, meditation with TTS, animated player, affirmations, action planner, vision boards, journal PDF export, onboarding, premium UI
🚧 Real IAP integration, cloud sync, unit tests, Lottie animations

## 📚 Documentation

- **[README.md](README.md)** - Project overview (this file)
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation for all services
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed architecture and design patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines and contribution process
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
