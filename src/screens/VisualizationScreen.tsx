import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { COLORS, SPACING, SIZES } from '../constants/theme';

interface VisionBoard {
  id: string;
  title: string;
  desire: string;
  created: Date;
  lastViewed: Date;
}

const VisualizationScreen = () => {
  const navigation = useNavigation();
  const [visionBoards, setVisionBoards] = useState<VisionBoard[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesire, setNewDesire] = useState('');
  const [activeVisualization, setActiveVisualization] = useState<VisionBoard | null>(null);
  const [timer, setTimer] = useState(68); // 68-second focus timer
  const [isVisualizing, setIsVisualizing] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isVisualizing) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsVisualizing(false);
          return 68;
        }
        return prev - 1;
      });
    }, 1000);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, [isVisualizing]);

  const handleCreateVision = () => {
    if (!newDesire.trim()) return;

    const newVision: VisionBoard = {
      id: Date.now().toString(),
      title: newDesire.substring(0, 30) + (newDesire.length > 30 ? '...' : ''),
      desire: newDesire,
      created: new Date(),
      lastViewed: new Date(),
    };

    setVisionBoards([newVision, ...visionBoards]);
    setNewDesire('');
    setShowCreateModal(false);
  };

  const handleStartVisualization = (vision: VisionBoard) => {
    setActiveVisualization(vision);
    setTimer(68);
    setIsVisualizing(true);
  };

  const handleStopVisualization = () => {
    setIsVisualizing(false);
    setActiveVisualization(null);
    setTimer(68);
    pulseAnim.setValue(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeVisualization && isVisualizing) {
    return (
      <GradientBackground>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleStopVisualization} style={styles.backButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Visualizing</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.visualizationContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary, COLORS.tertiary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.visualizationGradient}
            >
              <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
              </Animated.View>
            </LinearGradient>

            <Card style={styles.desireCard}>
              <Text style={styles.desireLabel}>Your Parallel Reality</Text>
              <Text style={styles.desireText}>{activeVisualization.desire}</Text>
            </Card>

            <Card style={styles.guidanceCard}>
              <Ionicons name="bulb" size={24} color={COLORS.warning} />
              <View style={styles.guidanceContent}>
                <Text style={styles.guidanceTitle}>Visualization Guidance</Text>
                <Text style={styles.guidanceText}>
                  Close your eyes. Feel this reality already exists in a parallel world. You are there now.
                  Experience the emotions, the sensations, the joy. This version of you has already manifested
                  this desire. Feel the gratitude.
                </Text>
              </View>
            </Card>

            <View style={styles.affirmations}>
              <Text style={styles.affirmationText}>✨ This or something better is manifesting now</Text>
              <Text style={styles.affirmationText}>🌟 I am aligned with my highest timeline</Text>
              <Text style={styles.affirmationText}>💫 My soul knows the way</Text>
            </View>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visualization</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Card style={styles.introCard}>
          <LinearGradient
            colors={[COLORS.primary + '30', COLORS.secondary + '30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.introGradient}
          >
            <Ionicons name="planet" size={56} color={COLORS.primary} />
            <Text style={styles.introTitle}>Parallel World Visualization</Text>
            <Text style={styles.introText}>
              Access parallel realities where your desires are already manifest.
              Experience them for 68 seconds to align with that timeline.
            </Text>
          </LinearGradient>
        </Card>

        {visionBoards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="sparkles-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Vision Boards Yet</Text>
            <Text style={styles.emptyText}>
              Create your first vision board to begin manifesting your desires.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.white} />
              <Text style={styles.createButtonText}>Create Vision Board</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Vision Boards</Text>
            <View style={styles.visionsList}>
              {visionBoards.map((vision) => (
                <Card
                  key={vision.id}
                  onPress={() => handleStartVisualization(vision)}
                  style={styles.visionCard}
                >
                  <View style={styles.visionIcon}>
                    <Ionicons name="eye" size={32} color={COLORS.primary} />
                  </View>
                  <View style={styles.visionContent}>
                    <Text style={styles.visionTitle}>{vision.title}</Text>
                    <Text style={styles.visionDesire} numberOfLines={2}>
                      {vision.desire}
                    </Text>
                    <Text style={styles.visionDate}>
                      Created {vision.created.toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={40} color={COLORS.primary} />
                </Card>
              ))}
            </View>
          </View>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Visualize</Text>
          <View style={styles.infoList}>
            {[
              { icon: 'eye', text: 'Find a quiet, comfortable space' },
              { icon: 'heart', text: 'Feel the emotions of having your desire now' },
              { icon: 'infinite', text: 'Experience 68 seconds in that reality' },
              { icon: 'sparkles', text: 'Trust that parallel world exists' },
              { icon: 'leaf', text: 'Take inspired action afterward' },
            ].map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Vision Board"
        confirmText="Create"
        onConfirm={handleCreateVision}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>
            Describe your desire as if it's already real in a parallel world:
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="I am living in my dream home by the ocean..."
            placeholderTextColor={COLORS.textSecondary}
            value={newDesire}
            onChangeText={setNewDesire}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.modalHint}>
            💡 Write in present tense, with emotion and gratitude
          </Text>
        </View>
      </Modal>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  introCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  introGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  introTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  introText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl * 2,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radius.lg,
    marginTop: SPACING.md,
  },
  createButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  visionsList: {
    gap: SPACING.md,
  },
  visionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  visionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  visionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  visionDesire: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  visionDate: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  infoCard: {
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoList: {
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  infoText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    flex: 1,
  },
  modalContent: {
    gap: SPACING.md,
  },
  modalLabel: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SPACING.md,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    minHeight: 100,
  },
  modalHint: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  // Active visualization styles
  visualizationContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  visualizationGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.xl,
    padding: SPACING.xl * 2,
    marginBottom: SPACING.xl,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  desireCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  desireLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  desireText: {
    fontSize: SIZES.font.lg,
    color: COLORS.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  guidanceCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  guidanceContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  guidanceTitle: {
    fontSize: SIZES.font.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  guidanceText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  affirmations: {
    gap: SPACING.md,
  },
  affirmationText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default VisualizationScreen;
