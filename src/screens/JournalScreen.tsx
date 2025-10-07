import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, SPACING, SIZES } from '../constants/theme';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string;
}

const JournalScreen = () => {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'A Peaceful Morning',
      content: 'Today I woke up feeling refreshed and ready to embrace the day...',
      date: 'Today, 9:00 AM',
      mood: '😊',
    },
    {
      id: '2',
      title: 'Reflections on Growth',
      content: 'I\'ve been thinking about how far I\'ve come on this journey...',
      date: 'Yesterday',
      mood: '🌟',
    },
    {
      id: '3',
      title: 'Gratitude Practice',
      content: 'Three things I\'m grateful for today: health, family, and peace...',
      date: '2 days ago',
      mood: '🙏',
    },
  ]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: title || 'Untitled Entry',
        content: content,
        date: new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'short',
          day: 'numeric'
        }),
        mood: '✨',
      };
      setEntries([newEntry, ...entries]);
    }
    setShowNewEntry(false);
    setTitle('');
    setContent('');
  };

  const handleOpenEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseEntry = () => {
    setSelectedEntry(null);
  };

  if (selectedEntry) {
    return (
      <GradientBackground>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Button
              title="Back"
              onPress={handleCloseEntry}
              variant="outline"
            />
            <Text style={styles.headerTitle}>Entry</Text>
            <View style={{ width: 80 }} />
          </View>

          <ScrollView style={styles.editorContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.entryDetailHeader}>
              <Text style={styles.entryDetailMood}>{selectedEntry.mood}</Text>
              <Text style={styles.entryDate}>{selectedEntry.date}</Text>
            </View>
            <Text style={styles.entryDetailTitle}>{selectedEntry.title}</Text>
            <Text style={styles.entryDetailContent}>{selectedEntry.content}</Text>
          </ScrollView>
        </View>
      </GradientBackground>
    );
  }

  if (showNewEntry) {
    return (
      <GradientBackground>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Button
              title="Cancel"
              onPress={() => setShowNewEntry(false)}
              variant="outline"
            />
            <Text style={styles.headerTitle}>New Entry</Text>
            <Button title="Save" onPress={handleSave} variant="primary" />
          </View>

          <ScrollView style={styles.editorContainer} showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.titleInput}
              placeholder="Entry Title"
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.contentInput}
              placeholder="How are you feeling today? What's on your mind?"
              placeholderTextColor={COLORS.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <Text style={styles.pageTitle}>Journal</Text>
          <Button
            title="New Entry"
            onPress={() => setShowNewEntry(true)}
            variant="primary"
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.entriesContainer}>
            {entries.map((entry) => (
              <Card key={entry.id} onPress={() => handleOpenEntry(entry)}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{entry.mood}</Text>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                </View>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryContent} numberOfLines={2}>
                  {entry.content}
                </Text>
                <View style={styles.entryFooter}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  pageTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editorContainer: {
    flex: 1,
  },
  titleInput: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
  contentInput: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    minHeight: 400,
  },
  entriesContainer: {
    gap: SPACING.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  entryMood: {
    fontSize: SIZES.font.xl,
  },
  entryDate: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  entryTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  entryContent: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  entryFooter: {
    alignItems: 'flex-end',
  },
  entryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
  entryDetailMood: {
    fontSize: 48,
  },
  entryDetailTitle: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
  entryDetailContent: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 24,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
});

export default JournalScreen;
