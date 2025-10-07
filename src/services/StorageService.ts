// StorageService.ts - Centralized local storage for soul data persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
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

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  gratitude?: string[];
  tags?: string[];
}

export interface VisionBoard {
  id: string;
  title: string;
  desire: string;
  images: string[];
  colors: string[];
  soundscape?: string;
  createdAt: string;
  lastViewed?: string;
}

export interface Affirmation {
  id: string;
  text: string;
  audioUri?: string;
  category: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Goal {
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

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

class StorageService {
  private readonly KEYS = {
    USER_PROFILE: '@soulsync:user_profile',
    JOURNAL_ENTRIES: '@soulsync:journal_entries',
    VISION_BOARDS: '@soulsync:vision_boards',
    AFFIRMATIONS: '@soulsync:affirmations',
    GOALS: '@soulsync:goals',
    SACRED_SPACE: '@soulsync:sacred_space',
  };

  // User Profile Management
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async updateStreak(): Promise<void> {
    const profile = await this.getUserProfile();
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.stats.lastActiveDate;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      profile.stats.streak = lastActive === yesterday ? profile.stats.streak + 1 : 1;
      profile.stats.lastActiveDate = today;
      await this.saveUserProfile(profile);
    }
  }

  async incrementSession(minutes: number): Promise<void> {
    const profile = await this.getUserProfile();
    if (!profile) return;

    profile.stats.totalSessions += 1;
    profile.stats.totalMinutes += minutes;
    await this.saveUserProfile(profile);
    await this.updateStreak();
  }

  // Journal Management
  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.JOURNAL_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  }

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      const index = entries.findIndex(e => e.id === entry.id);
      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.unshift(entry);
      }
      await AsyncStorage.setItem(this.KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }

  async deleteJournalEntry(id: string): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      const filtered = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(this.KEYS.JOURNAL_ENTRIES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  }

  // Vision Board Management
  async getVisionBoards(): Promise<VisionBoard[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.VISION_BOARDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting vision boards:', error);
      return [];
    }
  }

  async saveVisionBoard(board: VisionBoard): Promise<void> {
    try {
      const boards = await this.getVisionBoards();
      const index = boards.findIndex(b => b.id === board.id);
      if (index >= 0) {
        boards[index] = board;
      } else {
        boards.unshift(board);
      }
      await AsyncStorage.setItem(this.KEYS.VISION_BOARDS, JSON.stringify(boards));
    } catch (error) {
      console.error('Error saving vision board:', error);
    }
  }

  async deleteVisionBoard(id: string): Promise<void> {
    try {
      const boards = await this.getVisionBoards();
      const filtered = boards.filter(b => b.id !== id);
      await AsyncStorage.setItem(this.KEYS.VISION_BOARDS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting vision board:', error);
    }
  }

  // Affirmation Management
  async getAffirmations(): Promise<Affirmation[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.AFFIRMATIONS);
      return data ? JSON.parse(data) : this.getDefaultAffirmations();
    } catch (error) {
      console.error('Error getting affirmations:', error);
      return this.getDefaultAffirmations();
    }
  }

  async saveAffirmation(affirmation: Affirmation): Promise<void> {
    try {
      const affirmations = await this.getAffirmations();
      const index = affirmations.findIndex(a => a.id === affirmation.id);
      if (index >= 0) {
        affirmations[index] = affirmation;
      } else {
        affirmations.unshift(affirmation);
      }
      await AsyncStorage.setItem(this.KEYS.AFFIRMATIONS, JSON.stringify(affirmations));
    } catch (error) {
      console.error('Error saving affirmation:', error);
    }
  }

  private getDefaultAffirmations(): Affirmation[] {
    return [
      { id: '1', text: 'I am an eternal soul experiencing a temporary human journey', category: 'soul', isCustom: false, createdAt: new Date().toISOString() },
      { id: '2', text: 'My consciousness creates the reality I perceive', category: 'manifestation', isCustom: false, createdAt: new Date().toISOString() },
      { id: '3', text: 'I am exactly where my soul needs to be right now', category: 'soul', isCustom: false, createdAt: new Date().toISOString() },
      { id: '4', text: 'The universe flows through me with infinite abundance', category: 'abundance', isCustom: false, createdAt: new Date().toISOString() },
      { id: '5', text: 'I remember my connection to all that is', category: 'soul', isCustom: false, createdAt: new Date().toISOString() },
    ];
  }

  // Goals Management
  async getGoals(): Promise<Goal[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  async saveGoal(goal: Goal): Promise<void> {
    try {
      const goals = await this.getGoals();
      const index = goals.findIndex(g => g.id === goal.id);
      if (index >= 0) {
        goals[index] = goal;
      } else {
        goals.unshift(goal);
      }
      await AsyncStorage.setItem(this.KEYS.GOALS, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const filtered = goals.filter(g => g.id !== id);
      await AsyncStorage.setItem(this.KEYS.GOALS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }

  // Sacred Space Configuration
  async getSacredSpace(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SACRED_SPACE);
      return data ? JSON.parse(data) : { background: 'cosmic', soundscape: 'silence' };
    } catch (error) {
      console.error('Error getting sacred space:', error);
      return { background: 'cosmic', soundscape: 'silence' };
    }
  }

  async saveSacredSpace(config: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SACRED_SPACE, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving sacred space:', error);
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export default new StorageService();
