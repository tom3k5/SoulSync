// StorageService.test.ts - Unit tests for StorageService
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService, {
  UserProfile,
  JournalEntry,
  VisionBoard,
  Affirmation,
  Goal,
} from '../StorageService';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('User Profile Management', () => {
    const mockProfile: UserProfile = {
      id: 'test-user-123',
      name: 'Test Soul Seeker',
      email: 'test@soulsync.app',
      isPremium: false,
      onboardingCompleted: true,
      preferences: {
        language: 'en-US',
        theme: 'dark',
        reminderTime: '09:00',
        soundEnabled: true,
      },
      stats: {
        streak: 5,
        lastActiveDate: '2025-10-18',
        totalSessions: 42,
        totalMinutes: 630,
      },
    };

    test('getUserProfile returns null when no profile exists', async () => {
      const profile = await StorageService.getUserProfile();
      expect(profile).toBeNull();
    });

    test('saveUserProfile stores profile correctly', async () => {
      await StorageService.saveUserProfile(mockProfile);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@soulsync:user_profile',
        JSON.stringify(mockProfile)
      );
    });

    test('getUserProfile retrieves saved profile', async () => {
      await StorageService.saveUserProfile(mockProfile);

      const retrieved = await StorageService.getUserProfile();
      expect(retrieved).toEqual(mockProfile);
    });

    test('updateStreak increments streak for consecutive days', async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const profile = {
        ...mockProfile,
        stats: {
          ...mockProfile.stats,
          streak: 5,
          lastActiveDate: yesterday,
        },
      };

      await StorageService.saveUserProfile(profile);
      await StorageService.updateStreak();

      const updated = await StorageService.getUserProfile();
      expect(updated?.stats.streak).toBe(6);
      expect(updated?.stats.lastActiveDate).toBe(today);
    });

    test('updateStreak resets streak when day is missed', async () => {
      const today = new Date().toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

      const profile = {
        ...mockProfile,
        stats: {
          ...mockProfile.stats,
          streak: 5,
          lastActiveDate: twoDaysAgo,
        },
      };

      await StorageService.saveUserProfile(profile);
      await StorageService.updateStreak();

      const updated = await StorageService.getUserProfile();
      expect(updated?.stats.streak).toBe(1);
    });

    test('incrementSession updates stats correctly', async () => {
      await StorageService.saveUserProfile(mockProfile);
      await StorageService.incrementSession(15);

      const updated = await StorageService.getUserProfile();
      expect(updated?.stats.totalSessions).toBe(43);
      expect(updated?.stats.totalMinutes).toBe(645);
    });
  });

  describe('Journal Management', () => {
    const mockEntry: JournalEntry = {
      id: 'entry-123',
      date: '2025-10-18T10:00:00.000Z',
      title: 'Soul Insights',
      content: 'Today I connected with my higher self...',
      mood: 'peaceful',
      gratitude: ['health', 'abundance'],
      tags: ['meditation', 'qhht'],
    };

    test('getJournalEntries returns empty array when no entries exist', async () => {
      const entries = await StorageService.getJournalEntries();
      expect(entries).toEqual([]);
    });

    test('saveJournalEntry adds new entry', async () => {
      await StorageService.saveJournalEntry(mockEntry);

      const entries = await StorageService.getJournalEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(mockEntry);
    });

    test('saveJournalEntry updates existing entry', async () => {
      await StorageService.saveJournalEntry(mockEntry);

      const updatedEntry = {
        ...mockEntry,
        content: 'Updated content',
      };

      await StorageService.saveJournalEntry(updatedEntry);

      const entries = await StorageService.getJournalEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe('Updated content');
    });

    test('deleteJournalEntry removes entry', async () => {
      await StorageService.saveJournalEntry(mockEntry);
      await StorageService.deleteJournalEntry('entry-123');

      const entries = await StorageService.getJournalEntries();
      expect(entries).toHaveLength(0);
    });

    test('journal entries are sorted with newest first', async () => {
      const entry1 = { ...mockEntry, id: '1', date: '2025-10-16T10:00:00.000Z' };
      const entry2 = { ...mockEntry, id: '2', date: '2025-10-17T10:00:00.000Z' };
      const entry3 = { ...mockEntry, id: '3', date: '2025-10-18T10:00:00.000Z' };

      await StorageService.saveJournalEntry(entry1);
      await StorageService.saveJournalEntry(entry2);
      await StorageService.saveJournalEntry(entry3);

      const entries = await StorageService.getJournalEntries();
      expect(entries[0].id).toBe('3'); // Newest first
    });
  });

  describe('Vision Board Management', () => {
    const mockBoard: VisionBoard = {
      id: 'board-123',
      title: 'Abundant Life',
      desire: 'I manifest financial freedom and creative abundance',
      images: ['file://image1.jpg', 'file://image2.jpg'],
      colors: ['#FFD700', '#4A90E2'],
      soundscape: 'cosmic',
      createdAt: '2025-10-18T10:00:00.000Z',
    };

    test('getVisionBoards returns empty array initially', async () => {
      const boards = await StorageService.getVisionBoards();
      expect(boards).toEqual([]);
    });

    test('saveVisionBoard adds new board', async () => {
      await StorageService.saveVisionBoard(mockBoard);

      const boards = await StorageService.getVisionBoards();
      expect(boards).toHaveLength(1);
      expect(boards[0]).toEqual(mockBoard);
    });

    test('saveVisionBoard updates existing board', async () => {
      await StorageService.saveVisionBoard(mockBoard);

      const updatedBoard = {
        ...mockBoard,
        title: 'Updated Title',
      };

      await StorageService.saveVisionBoard(updatedBoard);

      const boards = await StorageService.getVisionBoards();
      expect(boards).toHaveLength(1);
      expect(boards[0].title).toBe('Updated Title');
    });

    test('deleteVisionBoard removes board', async () => {
      await StorageService.saveVisionBoard(mockBoard);
      await StorageService.deleteVisionBoard('board-123');

      const boards = await StorageService.getVisionBoards();
      expect(boards).toHaveLength(0);
    });
  });

  describe('Affirmation Management', () => {
    test('getAffirmations returns default affirmations when none exist', async () => {
      const affirmations = await StorageService.getAffirmations();

      expect(affirmations.length).toBeGreaterThan(0);
      expect(affirmations.every((a) => !a.isCustom)).toBe(true);
    });

    test('saveAffirmation adds custom affirmation', async () => {
      const customAffirmation: Affirmation = {
        id: 'aff-custom-123',
        text: 'I am a powerful manifestor',
        audioUri: 'file://recording.m4a',
        category: 'manifestation',
        isCustom: true,
        createdAt: '2025-10-18T10:00:00.000Z',
      };

      await StorageService.saveAffirmation(customAffirmation);

      const affirmations = await StorageService.getAffirmations();
      const customAffirmations = affirmations.filter((a) => a.isCustom);

      expect(customAffirmations).toHaveLength(1);
      expect(customAffirmations[0]).toEqual(customAffirmation);
    });
  });

  describe('Goals Management', () => {
    const mockGoal: Goal = {
      id: 'goal-123',
      title: 'Launch my business',
      description: 'Create online coaching practice',
      category: 'career',
      deadline: '2025-12-31',
      tasks: [
        { id: 'task-1', title: 'Register LLC', completed: false },
        { id: 'task-2', title: 'Build website', completed: true },
      ],
      visionBoardId: 'board-123',
      completed: false,
      createdAt: '2025-10-18T10:00:00.000Z',
    };

    test('getGoals returns empty array initially', async () => {
      const goals = await StorageService.getGoals();
      expect(goals).toEqual([]);
    });

    test('saveGoal adds new goal', async () => {
      await StorageService.saveGoal(mockGoal);

      const goals = await StorageService.getGoals();
      expect(goals).toHaveLength(1);
      expect(goals[0]).toEqual(mockGoal);
    });

    test('saveGoal updates existing goal', async () => {
      await StorageService.saveGoal(mockGoal);

      const updatedGoal = {
        ...mockGoal,
        completed: true,
      };

      await StorageService.saveGoal(updatedGoal);

      const goals = await StorageService.getGoals();
      expect(goals).toHaveLength(1);
      expect(goals[0].completed).toBe(true);
    });

    test('deleteGoal removes goal', async () => {
      await StorageService.saveGoal(mockGoal);
      await StorageService.deleteGoal('goal-123');

      const goals = await StorageService.getGoals();
      expect(goals).toHaveLength(0);
    });
  });

  describe('Sacred Space Management', () => {
    test('getSacredSpace returns default config', async () => {
      const config = await StorageService.getSacredSpace();

      expect(config).toEqual({
        background: 'cosmic',
        soundscape: 'silence',
      });
    });

    test('saveSacredSpace stores config', async () => {
      const config = {
        background: 'starfield',
        soundscape: '528hz',
      };

      await StorageService.saveSacredSpace(config);

      const retrieved = await StorageService.getSacredSpace();
      expect(retrieved).toEqual(config);
    });
  });

  describe('Data Management', () => {
    test('clearAllData removes all stored data', async () => {
      const profile = {
        ...{
          id: 'test',
          name: 'Test',
          isPremium: false,
          onboardingCompleted: true,
          preferences: { language: 'en', theme: 'dark' as const, reminderTime: '09:00', soundEnabled: true },
          stats: { streak: 0, lastActiveDate: '', totalSessions: 0, totalMinutes: 0 }
        },
      };
      await StorageService.saveUserProfile(profile);

      await StorageService.clearAllData();

      const retrievedProfile = await StorageService.getUserProfile();
      expect(retrievedProfile).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('getUserProfile handles errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const profile = await StorageService.getUserProfile();
      expect(profile).toBeNull();
    });

    test('saveUserProfile handles errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const profile = {
        ...{
          id: 'test',
          name: 'Test',
          isPremium: false,
          onboardingCompleted: true,
          preferences: { language: 'en', theme: 'dark' as const, reminderTime: '09:00', soundEnabled: true },
          stats: { streak: 0, lastActiveDate: '', totalSessions: 0, totalMinutes: 0 }
        },
      };

      await expect(StorageService.saveUserProfile(profile)).resolves.not.toThrow();
    });
  });
});
