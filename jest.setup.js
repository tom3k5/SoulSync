// Jest setup file
// Note: Using extend-expect from @testing-library/react-native

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    Recording: jest.fn(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getURI: jest.fn(() => 'file://test.m4a'),
    })),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            stopAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setPositionAsync: jest.fn(),
            setVolumeAsync: jest.fn(),
            getStatusAsync: jest.fn(() =>
              Promise.resolve({
                isLoaded: true,
                isPlaying: false,
                positionMillis: 0,
                durationMillis: 1000,
              })
            ),
            setOnPlaybackStatusUpdate: jest.fn(),
          },
        })
      ),
    },
  },
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock expo-print
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() =>
    Promise.resolve({ uri: 'file://test.pdf', numberOfPages: 1 })
  ),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native-purchases
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  setLogLevel: jest.fn(),
  logIn: jest.fn(),
  logOut: jest.fn(),
  getOfferings: jest.fn(() => Promise.resolve({ current: null })),
  getCustomerInfo: jest.fn(() =>
    Promise.resolve({
      entitlements: { active: {} },
    })
  ),
  purchasePackage: jest.fn(() =>
    Promise.resolve({
      customerInfo: { entitlements: { active: { premium: {} } } },
    })
  ),
  restorePurchases: jest.fn(() =>
    Promise.resolve({ entitlements: { active: {} } })
  ),
  showManagementUI: jest.fn(),
  LOG_LEVEL: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  },
}));

// Mock lottie-react-native
jest.mock('lottie-react-native', () => 'LottieView');

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
