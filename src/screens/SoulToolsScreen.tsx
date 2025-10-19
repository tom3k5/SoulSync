import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import StorageService from '../services/StorageService';

interface SoulTool {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
  count?: number;
  navigateTo: string;
}

const SoulToolsScreen = () => {
  const navigation = useNavigation();
  const [journalCount, setJournalCount] = useState(0);
  const [affirmationsCount, setAffirmationsCount] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [visionBoardsCount, setVisionBoardsCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const entries = await StorageService.getJournalEntries();
    const affirmations = await StorageService.getAffirmations();
    const goals = await StorageService.getGoals();
    const boards = await StorageService.getVisionBoards();

    setJournalCount(entries?.length || 0);
    setAffirmationsCount(affirmations?.filter((a: any) => a.isCustom)?.length || 0);
    setGoalsCount(goals?.filter((g: any) => !g.completed)?.length || 0);
    setVisionBoardsCount(boards?.length || 0);
  };

  const tools: SoulTool[] = [
    {
      id: 'journal',
      title: 'Soul Journal',
      subtitle: 'Record your spiritual insights and reflections',
      icon: 'book',
      color: COLORS.primary,
      gradient: [COLORS.primary + '30', COLORS.primary + '10'],
      count: journalCount,
      navigateTo: 'Journal',
    },
    {
      id: 'affirmations',
      title: 'Affirmations',
      subtitle: 'Create and record personal affirmations',
      icon: 'mic',
      color: COLORS.secondary,
      gradient: [COLORS.secondary + '30', COLORS.secondary + '10'],
      count: affirmationsCount,
      navigateTo: 'Affirmations',
    },
    {
      id: 'planner',
      title: 'Action Planner',
      subtitle: 'Manifest your vision with inspired action',
      icon: 'list',
      color: COLORS.tertiary,
      gradient: [COLORS.tertiary + '30', COLORS.tertiary + '10'],
      count: goalsCount,
      navigateTo: 'ActionPlanner',
    },
    {
      id: 'vision',
      title: 'Vision Boards',
      subtitle: 'Visualize parallel realities and desires',
      icon: 'git-network',
      color: COLORS.accent,
      gradient: [COLORS.accent + '30', COLORS.accent + '10'],
      count: visionBoardsCount,
      navigateTo: 'VisionBoard',
    },
  ];

  const renderToolCard = (tool: SoulTool) => (
    <TouchableOpacity
      key={tool.id}
      onPress={() => (navigation as any).navigate(tool.navigateTo)}
      style={styles.toolCard}
    >
      <Card style={styles.card}>
        <LinearGradient
          colors={[tool.gradient[0], tool.gradient[1]]}
          style={styles.cardGradient}
        >
          <View style={styles.toolHeader}>
            <View style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}>
              <Ionicons name={tool.icon} size={32} color={tool.color} />
            </View>
            {tool.count !== undefined && tool.count > 0 && (
              <View style={[styles.countBadge, { backgroundColor: tool.color }]}>
                <Text style={styles.countText}>{tool.count}</Text>
              </View>
            )}
          </View>

          <Text style={styles.toolTitle}>{tool.title}</Text>
          <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>

          <View style={styles.toolFooter}>
            <Text style={[styles.openText, { color: tool.color }]}>Open</Text>
            <Ionicons name="arrow-forward" size={20} color={tool.color} />
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Soul Tools</Text>
            <Text style={styles.subtitle}>Manifest Your Eternal Essence</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Your Manifestation Toolkit</Text>
          </View>
          <Text style={styles.infoText}>
            These tools help you translate your spiritual insights into physical reality.
            Journal your soul's wisdom, affirm your truth, plan inspired action, and visualize your desires.
          </Text>
        </Card>

        <View style={styles.toolsGrid}>
          {tools.map(renderToolCard)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>How to Use Soul Tools</Text>
          </View>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="book-outline" size={20} color={COLORS.primary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Journal Daily</Text>
                <Text style={styles.tipDescription}>
                  After meditation, capture insights while in theta state
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Ionicons name="mic-outline" size={20} color={COLORS.secondary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Record Affirmations</Text>
                <Text style={styles.tipDescription}>
                  Use your own voice for powerful subconscious programming
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Ionicons name="list-outline" size={20} color={COLORS.tertiary} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Plan Inspired Action</Text>
                <Text style={styles.tipDescription}>
                  Convert vision board desires into actionable steps
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Ionicons name="git-network-outline" size={20} color={COLORS.accent} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Create Vision Boards</Text>
                <Text style={styles.tipDescription}>
                  Focus for 68 seconds to quantum jump to parallel realities
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌟 "You are an eternal soul having a temporary human experience"
          </Text>
          <Text style={styles.footerQuote}>- Dolores Cannon</Text>
        </View>
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
  pageTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  infoCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  toolsGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  toolCard: {
    marginBottom: SPACING.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  countText: {
    fontSize: SIZES.font.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  toolTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  toolSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  toolFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  openText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  section: {
    marginVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tipsList: {
    gap: SPACING.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  footerQuote: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default SoulToolsScreen;
