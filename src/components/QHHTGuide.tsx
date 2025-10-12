import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Card from './Card';
import Button from './Button';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import AudioService from '../services/AudioService';

interface TechniqueProps {
  title: string;
  duration: string;
  description: string;
  benefits: string[];
  icon: string;
}

const TechniqueCard: React.FC<TechniqueProps> = ({ title, duration, description, benefits, icon }) => (
  <Card style={styles.techniqueCard}>
    <View style={styles.techniqueHeader}>
      <View style={[styles.techniqueIcon, { backgroundColor: COLORS.primary + '20' }]}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.techniqueTitleContainer}>
        <Text style={styles.techniqueTitle}>{title}</Text>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>
    </View>

    <Text style={styles.techniqueDescription}>{description}</Text>

    <View style={styles.benefitsSection}>
      <Text style={styles.benefitsTitle}>Key Benefits:</Text>
      {benefits.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.benefitText}>{benefit}</Text>
        </View>
      ))}
    </View>
  </Card>
);

const QHHTGuide: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize TTS when component mounts
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        console.log('Initializing TTS...');
        const voices = await AudioService.getAvailableVoices();
        console.log('Available voices:', voices.length);
        setAvailableVoices(voices);

        AudioService.setSpeechCallback((speaking: boolean) => {
          console.log('Speech callback - speaking:', speaking);
          setIsSpeaking(speaking);
        });

        // Test if Speech is available
        const isSpeechAvailable = await Speech.isSpeakingAsync();
        console.log('Speech API available, currently speaking:', isSpeechAvailable);
      } catch (error) {
        console.error('Error initializing TTS:', error);
      }
    };

    initializeTTS();

    // Animate the voice control when speaking
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      AudioService.clearSpeechCallback();
      AudioService.stopSpeech();
    };
  }, [isSpeaking, pulseAnim]);

  const speakSection = async (text: string, sectionName: string) => {
    try {
      console.log('Starting speech for section:', sectionName);
      console.log('Text to speak:', text.substring(0, 100) + '...');

      setCurrentSection(sectionName);
      await AudioService.speakText(text, {
        rate: 0.75, // Slower for educational content
        pitch: 1.0,
        onStart: () => {
          console.log('Speech started');
          setIsSpeaking(true);
        },
        onDone: () => {
          console.log('Speech completed');
          setIsSpeaking(false);
          setCurrentSection('');
        },
        onError: (error) => {
          console.error('TTS error in callback:', error);
          setIsSpeaking(false);
          setCurrentSection('');
        },
      });

      console.log('Speech initiated successfully');
    } catch (error) {
      console.error('Error speaking section:', error);
      setIsSpeaking(false);
      setCurrentSection('');
    }
  };

  const stopSpeaking = () => {
    AudioService.stopSpeech();
  };

  const techniques = [
    {
      title: 'QHHT Induction & Soul Remembrance',
      duration: '10 min',
      description: 'Traditional QHHT countdown induction (10-1) creates the hypnotic state. Soul remembrance visualization helps you reconnect with your eternal spiritual nature beyond the physical body.',
      benefits: [
        'Achieve deep relaxation and theta brainwaves',
        'Remember your soul\'s eternal nature',
        'Release ego attachments to the physical body',
        'Strengthen connection to higher consciousness'
      ],
      icon: 'infinite'
    },
    {
      title: 'QHHT Past Life Regression',
      duration: '20 min',
      description: 'Complete past life regression protocol where you select and fully immerse in significant lifetimes. Experience life-between-lives insights and soul lessons that impact your current incarnation.',
      benefits: [
        'Understand current life challenges from past life patterns',
        'Release karmic blocks and emotional baggage',
        'Gain wisdom from past life experiences',
        'Accelerate soul evolution and spiritual growth'
      ],
      icon: 'time-outline'
    },
    {
      title: 'Higher Self / Subconscious Communication',
      duration: '15 min',
      description: 'Direct communication with your higher self (subconscious). This all-knowing aspect provides guidance, answers questions, and offers profound insights about your life path and purpose.',
      benefits: [
        'Receive accurate guidance about life decisions',
        'Understand your soul\'s purpose and life lessons',
        'Access higher knowledge about health and relationships',
        'Receive comfort and validation from divine aspects of self'
      ],
      icon: 'person'
    },
    {
      title: 'QHHT Body Scanning & Theta Healing',
      duration: '30 min',
      description: 'Complete body scan identifies energetic blockages. Theta state healing releases trapped emotions, heals past traumas, and accelerates physical healing through subconscious intervention.',
      benefits: [
        'Identify and clear hidden energetic blockages',
        'Accelerate physical and emotional healing',
        'Release long-held emotional traumas',
        'Balance chakras and energy systems'
      ],
      icon: 'medkit'
    },
    {
      title: 'QHHT Future Life Progression',
      duration: '20 min',
      description: 'View potential future timelines to understand the consequences of current choices. Witness parallel realities and align with your highest soul path and purpose.',
      benefits: [
        'Make soul-aligned life decisions',
        'Manifest desired outcomes more effectively',
        'Understand karmic consequences of choices',
        'Choose timelines that serve soul evolution'
      ],
      icon: 'navigate'
    },
    {
      title: 'Meet Your Spirit Guide (QHHT Protocol)',
      duration: '25 min',
      description: 'Connect with your personal spirit guides, guardian angels, and spiritual support team. Receive protection, messages, and ongoing guidance for your spiritual journey.',
      benefits: [
        'Establish relationship with spirit guides',
        'Receive protection and divine guidance',
        'Understand your spiritual support system',
        'Open communication channels for ongoing guidance'
      ],
      icon: 'shield'
    }
  ];

  const qhhtPrinciples = [
    {
      title: 'The Subconscious Mind Knows Everything',
      description: 'Your subconscious (higher self) knows everything about you, your past lives, and your soul\'s purpose. It can answer any question accurately.'
    },
    {
      title: 'The Past is Not the Past',
      description: 'Past life experiences are happening simultaneously in the eternal now. They can be accessed to heal current life challenges.'
    },
    {
      title: 'The Body as Manifestation of Consciousness',
      description: 'Physical health issues often have energetic or emotional roots. The subconscious can identify and heal these at the deepest level.'
    },
    {
      title: 'Parallel Realities Exist',
      description: 'Multiple timelines and parallel realities exist. You can shift your current experience by aligning with desired realities.'
    },
    {
      title: 'Everything is Energy',
      description: 'All physical matter, emotions, and thoughts are forms of energy. Healing occurs by clearing blocked or discordant energies.'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Voice Control Bar */}
      <Animated.View style={[styles.voiceControlBar, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.voiceControls}>
          <TouchableOpacity
            style={[styles.voiceButton, isSpeaking && styles.voiceButtonActive]}
            onPress={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                speakSection(
                  'Welcome to the QHHT Guide by Dolores Cannon. Quantum Healing Hypnosis Technique is a powerful method for spiritual growth and healing.',
                  'Introduction'
                );
              }
            }}
          >
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium"}
              size={20}
              color={isSpeaking ? COLORS.white : COLORS.primary}
            />
            <Text style={[styles.voiceButtonText, isSpeaking && styles.voiceButtonTextActive]}>
              {isSpeaking ? 'Speaking...' : 'Voice Guide'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>QHHT Guide</Text>
          <Text style={styles.subtitle}>
            Quantum Healing Hypnosis Technique by Dolores Cannon
          </Text>
        </View>

        <Card style={styles.introductionCard}>
          <Text style={styles.introductionText}>
            QHHT (Quantum Healing Hypnosis Technique) is a powerful method developed by Dolores Cannon
            that allows individuals to access their subconscious (higher self) for healing, insight,
            and spiritual growth. This technique recognizes that we are eternal souls experiencing
            temporary physical incarnations, and that true healing occurs at the deepest levels of consciousness.
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QHHT Core Principles</Text>
          {qhhtPrinciples.map((principle, index) => (
            <Card key={index} style={styles.principleCard}>
              <View style={styles.principleHeader}>
                <Ionicons name="planet" size={24} color={COLORS.primary} />
                <Text style={styles.principleTitle}>{principle.title}</Text>
              </View>
              <Text style={styles.principleDescription}>{principle.description}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available QHHT Techniques</Text>
          {techniques.map((technique, index) => (
            <TechniqueCard key={index} {...technique} />
          ))}
        </View>

        <Card style={styles.disclaimerCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.warning} />
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>Important Notes</Text>
            <Text style={styles.disclaimerText}>
              • These sessions enhance your understanding of QHHT concepts but are not substitutes for professional QHHT therapy{'\n'}
              • QHHT is most effective when practiced under the guidance of a certified practitioner{'\n'}
              • Results may vary based on individual openness to hypnosis and spiritual experiences{'\n'}
              • Always combine spiritual insight with practical action and professional guidance when needed
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  voiceControlBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20',
    zIndex: 10,
  },
  voiceControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  voiceButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  voiceButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  voiceButtonTextActive: {
    color: COLORS.white,
  },
  scrollContainer: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: 70, // Account for voice control bar
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  introductionCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
  },
  introductionText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 24,
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
  principleCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  principleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  principleTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  principleDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  techniqueCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  techniqueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techniqueTitleContainer: {
    flex: 1,
  },
  techniqueTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  techniqueDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  benefitsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    paddingTop: SPACING.md,
  },
  benefitsTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  disclaimerCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  disclaimerText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default QHHTGuide;
