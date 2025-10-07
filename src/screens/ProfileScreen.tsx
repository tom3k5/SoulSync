import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../contexts/UserContext';
import { COLORS, SPACING, SIZES } from '../constants/theme';

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  hasArrow?: boolean;
}

const ProfileScreen = () => {
  const { user, logout } = useUser();

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        { id: '1', title: 'Notifications', icon: 'notifications', color: COLORS.primary, hasArrow: true },
        { id: '2', title: 'Reminders', icon: 'alarm', color: COLORS.secondary, hasArrow: true },
        { id: '3', title: 'Theme', icon: 'color-palette', color: COLORS.tertiary, hasArrow: true },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: '4', title: 'Edit Profile', icon: 'person', color: COLORS.success, hasArrow: true },
        { id: '5', title: 'Privacy', icon: 'shield-checkmark', color: COLORS.warning, hasArrow: true },
        { id: '6', title: 'Subscription', icon: 'card', color: COLORS.primary, hasArrow: true },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: '7', title: 'Help Center', icon: 'help-circle', color: COLORS.tertiary, hasArrow: true },
        { id: '8', title: 'Feedback', icon: 'chatbubble', color: COLORS.secondary, hasArrow: true },
        { id: '9', title: 'About', icon: 'information-circle', color: COLORS.primary, hasArrow: true },
      ],
    },
  ];

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color={COLORS.text} />
          </View>
          <Text style={styles.name}>{user?.name || 'Soul Seeker'}</Text>
          <Text style={styles.email}>{user?.email || 'user@soulsync.app'}</Text>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>127</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Days Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>18h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </Card>

        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.settingsCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => console.log(item.title)}
                  >
                    <View style={[styles.settingIcon, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.hasArrow && (
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            onPress={logout}
            variant="outline"
            fullWidth
          />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.card,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    flex: 1,
    fontSize: SIZES.font.md,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.card,
    marginLeft: SPACING.md + 40 + SPACING.md,
  },
  logoutContainer: {
    marginVertical: SPACING.xl,
  },
  version: {
    textAlign: 'center',
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
});

export default ProfileScreen;
