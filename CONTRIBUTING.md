# Contributing to SoulSync

Thank you for your interest in contributing to SoulSync! This guide will help you get started with development, understand our coding standards, and submit high-quality contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

This project follows a spiritual and inclusive approach:

- **Be Kind:** Treat all contributors with respect and compassion
- **Be Constructive:** Provide helpful feedback, not criticism
- **Be Patient:** Everyone is learning and growing
- **Be Open:** Welcome diverse perspectives and ideas

Remember: We're all eternal souls on a collaborative journey 🌌

---

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo CLI:** `npm install -g expo-cli`
- **Git**
- **iOS Simulator** (Mac only) or **Android Emulator**

### Initial Setup

1. **Fork the Repository**
   ```bash
   # Navigate to https://github.com/tom3k5/SoulSync
   # Click "Fork" button
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SoulSync.git
   cd SoulSync
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/tom3k5/SoulSync.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start Development Server**
   ```bash
   npm start
   ```

6. **Run on Device/Simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming Convention:**
- `feature/` - New features (e.g., `feature/add-breathing-exercise`)
- `fix/` - Bug fixes (e.g., `fix/audio-playback-crash`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-audio-service`)
- `test/` - Test additions (e.g., `test/add-storage-service-tests`)

### 2. Make Your Changes

Follow our [Coding Standards](#coding-standards) and keep commits focused and atomic.

### 3. Test Your Changes

```bash
# Type check
npx tsc --noEmit

# Run app and manually test
npm start

# Clear cache if needed
npm start -- --clear
```

### 4. Commit Your Changes

Follow our [Commit Convention](#commit-convention):

```bash
git add .
git commit -m "feat: add breathing exercise screen"
```

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

Go to GitHub and create a PR from your fork's branch to `upstream/main`.

---

## Project Structure

```
SoulSync/
├── src/
│   ├── components/       # Reusable UI components
│   ├── constants/        # Theme, colors, config
│   ├── contexts/         # React Context providers
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   └── services/         # Business logic layer
├── assets/               # Images, audio, fonts
├── App.tsx               # Root component
└── package.json          # Dependencies
```

**Key Principles:**
- **Components** = Presentation only, no business logic
- **Screens** = Container components, handle data fetching
- **Services** = Business logic, API calls, data persistence
- **Constants** = Single source of truth for theme

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

---

## Coding Standards

### TypeScript

✅ **Do:**
```typescript
// Use explicit types for function parameters
async function saveEntry(entry: JournalEntry): Promise<void> {
  await StorageService.saveJournalEntry(entry);
}

// Use interfaces for props
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

// Use const for immutable values
const MEDITATION_DURATION = 600; // seconds
```

❌ **Don't:**
```typescript
// Avoid 'any' type
function saveEntry(entry: any) { /* ... */ }

// Avoid implicit types
const duration = 600;

// Avoid type assertions when not necessary
const value = someValue as SomeType;
```

### Component Structure

Standard component template:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onPress }) => {
  // 1. State
  const [state, setState] = useState<Type>(initialValue);

  // 2. Effects
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, []);

  // 3. Handlers
  const handleAction = () => {
    // Handle action
  };

  // 4. Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

// 5. Styles
const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 18,
    color: COLORS.text,
  },
});

export default Component;
```

### Service Structure

Standard service template:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DataType {
  id: string;
  // ... fields
}

class ServiceName {
  private readonly KEYS = {
    DATA: '@soulsync:data_key',
  };

  /**
   * Gets data from storage
   * @returns Array of data items
   */
  async getData(): Promise<DataType[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.DATA);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting data:', error);
      return [];
    }
  }

  /**
   * Saves data to storage
   * @param item - Data item to save
   */
  async saveData(item: DataType): Promise<void> {
    try {
      const items = await this.getData();
      items.unshift(item);
      await AsyncStorage.setItem(this.KEYS.DATA, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}

export default new ServiceName();
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Services: `PascalCase.ts` (e.g., `StorageService.ts`)
- Screens: `PascalCaseScreen.tsx` (e.g., `HomeScreen.tsx`)
- Constants: `camelCase.ts` (e.g., `theme.ts`)

**Variables & Functions:**
- Variables: `camelCase` (e.g., `const userName = ...`)
- Functions: `camelCase` (e.g., `function fetchData() { ... }`)
- React Components: `PascalCase` (e.g., `const Button = () => ...`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `const MAX_RETRIES = 3`)

**Booleans:**
- Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasPermission`, `shouldRender`)

### Styling

**Use theme constants:**
```typescript
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary,
  },
});
```

**Avoid inline styles:**
```typescript
// ❌ Don't
<View style={{ padding: 16, backgroundColor: '#1A1F3A' }}>

// ✅ Do
<View style={styles.container}>
```

**Keep StyleSheets at bottom of file:**
```typescript
// Component code above...

const styles = StyleSheet.create({
  // All styles here
});

export default Component;
```

### Error Handling

**Always use try-catch for async operations:**
```typescript
const loadData = async () => {
  try {
    const data = await SomeService.getData();
    setData(data);
  } catch (error) {
    console.error('Error loading data:', error);
    Alert.alert('Error', 'Could not load data. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Log errors with context:**
```typescript
console.error('Error saving journal entry:', error);
// Not just: console.error(error);
```

### Comments

**Use JSDoc for functions:**
```typescript
/**
 * Saves a journal entry to local storage
 * @param entry - The journal entry to save
 * @returns Promise that resolves when saved
 */
async saveJournalEntry(entry: JournalEntry): Promise<void> {
  // Implementation
}
```

**Add inline comments for complex logic:**
```typescript
// Check if user was active yesterday for streak calculation
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
profile.stats.streak = lastActive === yesterday ? profile.stats.streak + 1 : 1;
```

**Avoid obvious comments:**
```typescript
// ❌ Don't
const name = 'John'; // Set name to John

// ✅ Do (no comment needed)
const name = 'John';
```

### Imports

**Order imports:**
1. React/React Native
2. Third-party libraries
3. Local components
4. Services
5. Constants/types

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card } from '../components';
import StorageService from '../services/StorageService';
import { COLORS, SPACING } from '../constants/theme';
import { JournalEntry } from '../services/StorageService';
```

---

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- ✅ **TypeScript compilation:** `npx tsc --noEmit`
- ✅ **iOS simulator:** Test all affected screens
- ✅ **Android emulator:** Test all affected screens
- ✅ **Different screen sizes:** Test on various device sizes
- ✅ **Edge cases:** Empty states, error states, loading states
- ✅ **Navigation:** Ensure navigation flows work correctly
- ✅ **Performance:** No lag or jank in animations

### Future: Unit Tests

When adding unit tests (future):

```typescript
// __tests__/StorageService.test.ts
import StorageService, { JournalEntry } from '../src/services/StorageService';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear storage before each test
  });

  it('should save and retrieve journal entry', async () => {
    const entry: JournalEntry = {
      id: 'test_1',
      date: new Date().toISOString(),
      title: 'Test Entry',
      content: 'Test content',
    };

    await StorageService.saveJournalEntry(entry);
    const entries = await StorageService.getJournalEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(entry);
  });
});
```

---

## Commit Convention

We follow **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring (no functional changes)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, config, etc.)

### Examples

```bash
# Feature
git commit -m "feat: add breathing exercise screen"

# Bug fix
git commit -m "fix: resolve audio playback crash on iOS"

# Documentation
git commit -m "docs: update README with installation steps"

# Refactor
git commit -m "refactor: extract audio logic into AudioService"

# With scope
git commit -m "feat(meditation): add TTS narration for QHHT scripts"

# With body and footer
git commit -m "fix(audio): prevent memory leak in audio player

The audio player was not properly unloading Sound objects when
unmounting, causing memory to accumulate over time.

Closes #42"
```

### Commit Best Practices

✅ **Do:**
- Write clear, concise commit messages
- Use imperative mood ("add feature" not "added feature")
- Capitalize first letter of subject
- Don't end subject with period
- Keep subject under 50 characters
- Use body to explain "what" and "why" (not "how")

❌ **Don't:**
- Write vague messages like "fix bug" or "update code"
- Commit unrelated changes together
- Commit commented-out code
- Commit console.log statements (use for debugging only)

---

## Pull Request Process

### Before Submitting

1. **Update from main:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run TypeScript check:**
   ```bash
   npx tsc --noEmit
   ```

3. **Test thoroughly** on iOS and Android

4. **Review your changes:**
   ```bash
   git diff upstream/main
   ```

### PR Title

Use the same format as commit messages:

```
feat: add breathing exercise screen
fix: resolve audio playback crash on iOS
docs: update contributing guidelines
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on physical device (iOS)
- [ ] Tested on physical device (Android)

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Related Issues
Closes #[issue number]
```

### Review Process

1. **Automated checks** (future):
   - TypeScript compilation
   - Linting
   - Unit tests

2. **Code review:**
   - Maintainers will review your code
   - Address feedback constructively
   - Make requested changes in new commits

3. **Approval:**
   - Once approved, maintainer will merge
   - Your contribution will be in the next release!

---

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Update to latest version** and test again
3. **Gather information:**
   - Device type (iOS/Android)
   - OS version
   - App version
   - Steps to reproduce

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Device (please complete the following information):**
 - Device: [e.g. iPhone 14 Pro]
 - OS: [e.g. iOS 17.1]
 - App Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

---

## Development Tips

### Hot Reloading

- **iOS/Android:** Press `Cmd + R` (iOS) or `R R` (Android) to reload
- **Fast Refresh** automatically reloads on save

### Debugging

**React Native Debugger:**
```bash
# In simulator, shake device or press Cmd + D (iOS) / Cmd + M (Android)
# Select "Debug with Chrome"
```

**Logging:**
```typescript
console.log('Debug info:', data);
console.warn('Warning message');
console.error('Error:', error);
```

**React DevTools:**
```bash
npm install -g react-devtools
react-devtools
```

### Clear Cache

If experiencing strange issues:
```bash
npm start -- --clear
# or
rm -rf node_modules
npm install
```

### Useful Commands

```bash
# Type check
npx tsc --noEmit

# Clear watchman (if issues)
watchman watch-del-all

# Reset Metro bundler
npx react-native start --reset-cache

# Check expo doctor
npx expo-doctor
```

---

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)

### Project Docs
- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
- [API_REFERENCE.md](API_REFERENCE.md) - Complete API documentation

### Community
- [GitHub Issues](https://github.com/tom3k5/SoulSync/issues) - Report bugs and request features
- [GitHub Discussions](https://github.com/tom3k5/SoulSync/discussions) - Ask questions and share ideas

---

## Questions?

If you have questions or need help:

1. Check [existing issues](https://github.com/tom3k5/SoulSync/issues)
2. Read [documentation](README.md)
3. Create a new issue with your question

---

## License

By contributing to SoulSync, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to SoulSync!**

**Remember: You are an eternal soul experiencing a temporary human journey. Your code is a gift to the collective consciousness.** 🌌
