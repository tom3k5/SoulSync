// ActionPlannerScreen.tsx - Bridge parallel worlds to this reality with inspired action
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import * as Haptics from 'expo-haptics';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import StorageService, { Goal, Task, VisionBoard } from '../services/StorageService';
import { COLORS, SPACING, SIZES } from '../constants/theme';

const ActionPlannerScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [visionBoards, setVisionBoards] = useState<VisionBoard[]>([]);
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    requestCalendarPermissions();
  }, []);

  const loadData = async () => {
    const storedGoals = await StorageService.getGoals();
    const storedBoards = await StorageService.getVisionBoards();
    setGoals(storedGoals);
    setVisionBoards(storedBoards);
  };

  const requestCalendarPermissions = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setHasCalendarPermission(true);
        await findOrCreateCalendar();
      }
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
    }
  };

  const findOrCreateCalendar = async () => {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const soulSyncCalendar = calendars.find((cal) => cal.title === 'SoulSync');

      if (soulSyncCalendar) {
        setCalendarId(soulSyncCalendar.id);
      } else {
        // Create SoulSync calendar
        const defaultCalendar = calendars.find(
          (cal) => cal.allowsModifications && cal.source.name === 'Default'
        );

        if (defaultCalendar) {
          const newCalendarId = await Calendar.createCalendarAsync({
            title: 'SoulSync',
            color: COLORS.primary,
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendar.source.id,
            source: defaultCalendar.source,
            name: 'SoulSync',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          });
          setCalendarId(newCalendarId);
        }
      }
    } catch (error) {
      console.error('Error finding/creating calendar:', error);
    }
  };

  const generateTasksFromVision = (vision: VisionBoard): Task[] => {
    const tasks: Task[] = [];
    const baseDate = new Date();

    // Simple rule-based task generation
    const desire = vision.desire.toLowerCase();

    // Career/Business related
    if (desire.includes('career') || desire.includes('job') || desire.includes('business')) {
      tasks.push({
        id: `${Date.now()}_1`,
        title: 'Update resume/portfolio',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_2`,
        title: 'Reach out to 3 contacts in your field',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_3`,
        title: 'Research companies/opportunities',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Relationship related
    else if (desire.includes('love') || desire.includes('relationship') || desire.includes('partner')) {
      tasks.push({
        id: `${Date.now()}_1`,
        title: 'Practice self-love meditation',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_2`,
        title: 'Attend social event or join community',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_3`,
        title: 'Journal about ideal relationship qualities',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Health/Wellness related
    else if (desire.includes('health') || desire.includes('fitness') || desire.includes('wellness')) {
      tasks.push({
        id: `${Date.now()}_1`,
        title: 'Schedule health checkup',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_2`,
        title: 'Start 15-min daily exercise routine',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_3`,
        title: 'Meal prep healthy foods',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Financial/Abundance related
    else if (desire.includes('money') || desire.includes('wealth') || desire.includes('abundance') || desire.includes('financial')) {
      tasks.push({
        id: `${Date.now()}_1`,
        title: 'Review and organize finances',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_2`,
        title: 'Research income opportunities',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_3`,
        title: 'Create abundance affirmation practice',
        completed: false,
        dueDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Generic tasks for any desire
    else {
      tasks.push({
        id: `${Date.now()}_1`,
        title: `Research steps to achieve: ${vision.desire}`,
        completed: false,
        dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_2`,
        title: `Journal about: ${vision.desire}`,
        completed: false,
        dueDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
      tasks.push({
        id: `${Date.now()}_3`,
        title: `Take one small action toward: ${vision.desire}`,
        completed: false,
        dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return tasks;
  };

  const handleGenerateGoal = async (vision: VisionBoard) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const tasks = generateTasksFromVision(vision);
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: vision.desire,
      description: `Manifest your vision: ${vision.desire}`,
      category: 'vision',
      tasks,
      visionBoardId: vision.id,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveGoal(newGoal);
    await loadData();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Soul-Aligned Action Plan Created',
      `Generated ${tasks.length} inspired tasks to manifest: ${vision.desire}`
    );
  };

  const syncTaskToCalendar = async (task: Task, goalTitle: string) => {
    if (!hasCalendarPermission || !calendarId) {
      Alert.alert(
        'Calendar Access Required',
        'Please grant calendar permissions to sync tasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: requestCalendarPermissions },
        ]
      );
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const dueDate = new Date(task.dueDate!);
      const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      await Calendar.createEventAsync(calendarId, {
        title: `🌟 ${task.title}`,
        notes: `Soul-aligned action from goal: ${goalTitle}\n\nGenerated by SoulSync`,
        startDate: dueDate,
        endDate: endDate,
        timeZone: 'UTC',
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Synced to Calendar', `"${task.title}" added to your SoulSync calendar.`);
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      Alert.alert('Sync Error', 'Could not sync task to calendar.');
    }
  };

  const toggleTaskComplete = async (goalId: string, taskId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const task = goal.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    // Check if all tasks are complete
    const allComplete = goal.tasks.every((t) => t.completed);
    if (allComplete) {
      goal.completed = true;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Goal Manifested! 🌟',
        `Congratulations! You've completed all tasks for: ${goal.title}`
      );
    }

    await StorageService.saveGoal(goal);
    await loadData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Inspired Action Planner</Text>
          <Text style={styles.subtitle}>Bridge your parallel world visions to this reality</Text>
        </View>

        {visionBoards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generate from Vision Boards</Text>
            {visionBoards.map((vision) => {
              const hasGoal = goals.some((g) => g.visionBoardId === vision.id);
              return (
                <Card key={vision.id} style={styles.visionCard}>
                  <View style={styles.visionHeader}>
                    <Ionicons name="git-network" size={24} color={COLORS.primary} />
                    <Text style={styles.visionTitle}>{vision.desire}</Text>
                  </View>
                  {!hasGoal ? (
                    <Button
                      title="Generate Action Plan"
                      onPress={() => handleGenerateGoal(vision)}
                      size="small"
                      icon="sparkles"
                    />
                  ) : (
                    <View style={styles.generatedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.generatedText}>Plan Created</Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <Text style={styles.sectionSubtitle}>
            {goals.filter((g) => !g.completed).length} active goal(s)
          </Text>

          {goals.filter((g) => !g.completed).length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="planet" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No active goals yet</Text>
              <Text style={styles.emptySubtext}>
                Create a vision board first, then generate action plans here!
              </Text>
            </Card>
          ) : (
            goals
              .filter((g) => !g.completed)
              .map((goal) => (
                <Card key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressText}>
                        {goal.tasks.filter((t) => t.completed).length}/{goal.tasks.length}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tasksList}>
                    {goal.tasks.map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <TouchableOpacity
                          onPress={() => toggleTaskComplete(goal.id, task.id)}
                          style={styles.taskCheckbox}
                        >
                          <Ionicons
                            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={task.completed ? COLORS.success : COLORS.textSecondary}
                          />
                        </TouchableOpacity>

                        <View style={styles.taskContent}>
                          <Text
                            style={[
                              styles.taskTitle,
                              task.completed && styles.taskTitleCompleted,
                            ]}
                          >
                            {task.title}
                          </Text>
                          {task.dueDate && (
                            <Text style={styles.taskDate}>{formatDate(task.dueDate)}</Text>
                          )}
                        </View>

                        {!task.completed && task.dueDate && (
                          <TouchableOpacity
                            onPress={() => syncTaskToCalendar(task, goal.title)}
                            style={styles.calendarButton}
                          >
                            <Ionicons name="calendar" size={20} color={COLORS.secondary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </Card>
              ))
          )}
        </View>

        {goals.filter((g) => g.completed).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manifested Goals 🌟</Text>
            {goals
              .filter((g) => g.completed)
              .map((goal) => (
                <Card key={goal.id} style={styles.completedGoalCard}>
                  <Ionicons name="trophy" size={24} color={COLORS.secondary} />
                  <Text style={styles.completedGoalTitle}>{goal.title}</Text>
                  <Text style={styles.completedDate}>
                    Completed {new Date(goal.createdAt).toLocaleDateString()}
                  </Text>
                </Card>
              ))}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  visionCard: {
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  visionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  visionTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  generatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  generatedText: {
    fontSize: SIZES.font.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: SIZES.font.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  goalCard: {
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  progressBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  progressText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tasksList: {
    gap: SPACING.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskCheckbox: {
    padding: SPACING.xs,
  },
  taskContent: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskDate: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  calendarButton: {
    padding: SPACING.xs,
  },
  completedGoalCard: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success + '10',
  },
  completedGoalTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  completedDate: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
});

export default ActionPlannerScreen;
