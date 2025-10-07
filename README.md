# SoulSync 🌌

A spiritual manifestation mobile app inspired by Dolores Cannon's Quantum Healing Hypnosis Technique (QHHT). Built with React Native and Expo to help users reconnect with their soul's essence, visualize parallel realities, and manifest their desires.

## ✨ Features

### Implemented ✅

- **QHHT-Inspired Onboarding** - 4 beautiful slides introducing soul consciousness and quantum realities
- **Soul Remembrance Meditation** - 5 guided meditation tracks with full audio player
- **Parallel World Visualization** - Create vision boards with 68-second manifestation timer
- **Daily Affirmations** - 15 Dolores Cannon-inspired messages with notifications
- **Streak Tracking** - Monitor your daily practice and progress
- **Cosmic Theme** - Deep space design with soul gold and serenity blue colors
- **Premium Features** - Gated content (3 free meditations, 1 free vision board)

### Coming Soon 🚧

- Affirmation Weaver with voice recording
- Inspired Action Planner with calendar sync
- Sacred Space customization
- Journal PDF export
- In-app purchases

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
# Scan QR code with Expo Go app on physical device
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
│   ├── constants/           # Theme and config (cosmic colors)
│   ├── contexts/            # React Context (UserContext)
│   ├── navigation/          # Navigation setup
│   ├── screens/             # All app screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── MeditationScreen.tsx
│   │   ├── MeditationPlayerScreen.tsx
│   │   ├── VisionBoardScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── JournalScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── services/            # Business logic
│       ├── StorageService.ts      # AsyncStorage wrapper
│       ├── AudioService.ts        # Audio playback/recording
│       └── NotificationService.ts # Daily reminders
├── assets/                  # Images, audio, fonts
└── README.md
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

- `expo` ~54.0.12 - React Native framework
- `@react-native-async-storage/async-storage` - Local storage
- `expo-av` - Audio playback
- `expo-notifications` - Push notifications
- `expo-image-picker` - Image selection
- `expo-linear-gradient` - Gradient UI
- `@react-navigation/native` - Navigation
- Plus 5 more supporting packages

## 🎯 Navigation

```
Onboarding (first launch)
  ↓
Login (if not authenticated)
  ↓
Main App (Bottom Tabs):
├── Home - Daily affirmations & stats
├── Meditate - Meditation library & player
├── Visualize - Vision board creator
├── Journal - Entry writing
└── Profile - Settings & stats
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

**Notifications not appearing?**
- Grant permissions during onboarding
- Check device notification settings

**Images not loading?**
- Grant camera roll permissions
- Test: `await ImagePicker.requestMediaLibraryPermissionsAsync()`

**App crashes?**
- Clear cache: `npm start -- --clear`
- Reinstall: `rm -rf node_modules && npm install`

## 🎓 Architecture

- **Service Layer Pattern** - Business logic separated from UI
- **TypeScript** - Full type safety
- **Centralized Theme** - Single source of truth for design
- **Component Composition** - Reusable UI components
- **Error Handling** - Graceful async operation handling

## 🌟 Spiritual Design

This app uses soul-centered language throughout:
- Error messages: "Realign your energy and try again"
- Code comments referencing quantum fields
- UI emphasizing cosmic aesthetics
- Features designed for introspection

## 📊 Progress

**~65% Core Features Complete**

✅ Services, meditation, vision boards, onboarding, theme
🚧 Affirmation weaver, action planner, IAP, tests

## 🙏 Credits

- **Inspiration**: Dolores Cannon's QHHT methodology
- **Framework**: React Native, Expo
- **Icons**: @expo/vector-icons (Ionicons)

## 📄 License

MIT License - Built with love and cosmic consciousness ✨

---

**Remember: You are an eternal soul experiencing a temporary human journey. This app helps you remember who you truly are.** 🌌
