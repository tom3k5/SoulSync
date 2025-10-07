// VisionBoardScreen.tsx - Parallel World Visualization & Vision Board Creator
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import StorageService, { VisionBoard, UserProfile } from '../services/StorageService';

const { width } = Dimensions.get('window');

const VisionBoardScreen = () => {
  const [boards, setBoards] = useState<VisionBoard[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoard, setNewBoard] = useState<Partial<VisionBoard>>({
    title: '',
    desire: '',
    images: [],
    colors: [COLORS.primary],
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [focusTimer, setFocusTimer] = useState(68); // 68-second focus timer
  const [isFocusing, setIsFocusing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedBoards = await StorageService.getVisionBoards();
    const userProfile = await StorageService.getUserProfile();
    setBoards(loadedBoards);
    setProfile(userProfile);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewBoard({
        ...newBoard,
        images: [...(newBoard.images || []), result.assets[0].uri],
      });
    }
  };

  const saveVisionBoard = async () => {
    if (!newBoard.title?.trim() || !newBoard.desire?.trim()) {
      Alert.alert('Required fields', 'Please enter a title and your desire');
      return;
    }

    // Check premium limit
    if (!profile?.isPremium && boards.length >= 1) {
      Alert.alert(
        'Premium Feature',
        'Free users can create 1 vision board. Upgrade to Premium for unlimited vision boards!',
        [{ text: 'OK' }]
      );
      return;
    }

    const board: VisionBoard = {
      id: Date.now().toString(),
      title: newBoard.title!,
      desire: newBoard.desire!,
      images: newBoard.images || [],
      colors: newBoard.colors || [COLORS.primary],
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveVisionBoard(board);
    await loadData();
    setIsCreating(false);
    setNewBoard({ title: '', desire: '', images: [], colors: [COLORS.primary] });
    Alert.alert('Vision Created', 'Your parallel reality has been anchored in consciousness');
  };

  const deleteBoard = async (id: string) => {
    Alert.alert('Delete Vision Board', 'Are you sure you want to delete this vision?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await StorageService.deleteVisionBoard(id);
          await loadData();
        },
      },
    ]);
  };

  const start68SecondFocus = (board: VisionBoard) => {
    setIsFocusing(true);
    setFocusTimer(68);

    const interval = setInterval(() => {
      setFocusTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFocusing(false);
          Alert.alert(
            'Manifestation Complete',
            'You have successfully tuned into the parallel reality where your desire already exists. Feel the reality of it now.'
          );
          return 68;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (isCreating) {
    return (
      <GradientBackground>
        <StatusBar style="light" />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsCreating(false)}>
              <Ionicons name="arrow-back" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Vision Board</Text>
            <View style={{ width: 28 }} />
          </View>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Your Desire</Text>
            <Text style={styles.hint}>
              What reality do you wish to manifest? Describe it as if it already exists.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Title (e.g., Abundant Life)"
              placeholderTextColor={COLORS.textSecondary}
              value={newBoard.title}
              onChangeText={(text) => setNewBoard({ ...newBoard, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="I am living in abundance. I feel grateful for..."
              placeholderTextColor={COLORS.textSecondary}
              value={newBoard.desire}
              onChangeText={(text) => setNewBoard({ ...newBoard, desire: text })}
              multiline
              numberOfLines={4}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Anchors</Text>
            <Text style={styles.hint}>
              Add images that represent your desired reality
            </Text>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>

            {newBoard.images && newBoard.images.length > 0 && (
              <View style={styles.imageGrid}>
                {newBoard.images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImage}
                      onPress={() => {
                        const updated = newBoard.images?.filter((_, i) => i !== index);
                        setNewBoard({ ...newBoard, images: updated });
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <TouchableOpacity style={styles.saveButton} onPress={saveVisionBoard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.tertiary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Create Vision</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.mainTitle}>Parallel World</Text>
            <Text style={styles.subtitle}>Vision Boards</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsCreating(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.secondary} />
          <Text style={styles.infoText}>
            In quantum physics, all possibilities exist simultaneously. Create vision boards to
            tune into the parallel reality where your desires already exist.
          </Text>
        </Card>

        {!profile?.isPremium && (
          <Card style={styles.premiumBanner}>
            <LinearGradient
              colors={[COLORS.secondary + '20', COLORS.primary + '20']}
              style={styles.premiumGradient}
            >
              <Ionicons name="star" size={24} color={COLORS.secondary} />
              <Text style={styles.premiumText}>
                Free: 1 vision board • Premium: Unlimited
              </Text>
            </LinearGradient>
          </Card>
        )}

        {boards.length === 0 ? (
          <Card style={styles.emptyState}>
            <Ionicons name="git-network" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Vision Boards Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first vision board to anchor your desires in the quantum field
            </Text>
          </Card>
        ) : (
          boards.map((board) => (
            <Card key={board.id} style={styles.boardCard}>
              <View style={styles.boardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boardTitle}>{board.title}</Text>
                  <Text style={styles.boardDate}>
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteBoard(board.id)}>
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <Text style={styles.boardDesire} numberOfLines={3}>
                {board.desire}
              </Text>

              {board.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.boardImages}>
                    {board.images.map((uri, index) => (
                      <Image key={index} source={{ uri }} style={styles.boardImage} />
                    ))}
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.focusButton}
                onPress={() => start68SecondFocus(board)}
                disabled={isFocusing}
              >
                <LinearGradient
                  colors={[COLORS.accent, COLORS.tertiary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.focusButtonGradient}
                >
                  <Ionicons name="eye" size={20} color={COLORS.white} />
                  <Text style={styles.focusButtonText}>
                    {isFocusing ? `Focusing... ${focusTimer}s` : '68-Second Focus'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Card>
          ))
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  mainTitle: {
    fontSize: SIZES.font.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  premiumBanner: {
    padding: 0,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  premiumText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SPACING.md,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    borderRadius: SIZES.radius.md,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: SIZES.font.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: (width - SPACING.lg * 2 - SPACING.xl * 2 - SPACING.sm * 2) / 3,
    height: (width - SPACING.lg * 2 - SPACING.xl * 2 - SPACING.sm * 2) / 3,
    borderRadius: SIZES.radius.sm,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  saveButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  saveButtonText: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyDescription: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  boardCard: {
    marginBottom: SPACING.lg,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  boardTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  boardDate: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  boardDesire: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  boardImages: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  boardImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.sm,
  },
  focusButton: {
    borderRadius: SIZES.radius.md,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  focusButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  focusButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default VisionBoardScreen;
