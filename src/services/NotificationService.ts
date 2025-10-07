// NotificationService.ts - Manages daily affirmations and reminders
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationConfig {
  enabled: boolean;
  time: string; // HH:MM format
  affirmationText?: string;
}

class NotificationService {
  private notificationId: string | null = null;

  // Request permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-affirmations', {
          name: 'Daily Affirmations',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule daily affirmation notification
  async scheduleDailyAffirmation(config: NotificationConfig): Promise<void> {
    try {
      // Cancel existing notification if any
      if (this.notificationId) {
        await this.cancelDailyAffirmation();
      }

      if (!config.enabled) return;

      const [hours, minutes] = config.time.split(':').map(Number);

      // Get random affirmation
      const affirmations = this.getAffirmations();
      const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

      this.notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '✨ Soul Wisdom Reminder',
          body: config.affirmationText || randomAffirmation,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'daily_affirmation' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log('Daily affirmation scheduled:', this.notificationId);
    } catch (error) {
      console.error('Error scheduling daily affirmation:', error);
    }
  }

  // Cancel daily affirmation
  async cancelDailyAffirmation(): Promise<void> {
    try {
      if (this.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(this.notificationId);
        this.notificationId = null;
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Schedule meditation reminder
  async scheduleMeditationReminder(timeInSeconds: number): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧘 Meditation Complete',
          body: 'Your soul journey has reached its destination. Take a moment to reflect.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: timeInSeconds,
        },
      });
    } catch (error) {
      console.error('Error scheduling meditation reminder:', error);
    }
  }

  // Send immediate notification
  async sendNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // immediate
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationId = null;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Dolores Cannon-inspired affirmations
  private getAffirmations(): string[] {
    return [
      'You are an eternal soul experiencing a temporary human journey',
      'Your consciousness creates the reality you perceive',
      'Every breath connects you to the infinite universe within',
      'You are exactly where your soul needs to be right now',
      'The past and future exist only in your mind - be present',
      'You have access to all knowledge through your higher self',
      'Your soul chose this life for its unique lessons and growth',
      'Love is the frequency that connects all consciousness',
      'You are a powerful creator in the quantum field of possibilities',
      'Remember: you are the universe experiencing itself',
      'Trust the journey your soul has mapped for you',
      'Every challenge is your soul\'s invitation to expand',
      'You contain multitudes of lifetimes and wisdom within',
      'Your thoughts ripple through the fabric of reality',
      'Connect to Source through stillness and breath',
    ];
  }

  // Add notification response listener
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Add notification received listener (foreground)
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export default new NotificationService();
