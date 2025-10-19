// PremiumUpgradeScreen.tsx - Premium subscription upgrade flow
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PurchasesPackage } from 'react-native-purchases';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import Button from '../components/Button';
import SubscriptionService from '../services/SubscriptionService';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { useUser } from '../contexts/UserContext';

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  savings?: string;
  isPopular?: boolean;
  package?: PurchasesPackage;
}

const PremiumUpgradeScreen = ({ navigation }: any) => {
  const { user, setUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await SubscriptionService.getOfferings();

      if (!offerings) {
        // Fallback to mock plans if RevenueCat not configured
        setPlans([
          {
            id: 'monthly',
            title: 'Monthly',
            price: '$4.99',
            period: '/month',
          },
          {
            id: 'yearly',
            title: 'Yearly',
            price: '$39.99',
            period: '/year',
            savings: 'Save 33%',
            isPopular: true,
          },
        ]);
        setLoading(false);
        return;
      }

      const loadedPlans: PricingPlan[] = [];

      // Add monthly plan
      if (offerings.monthly) {
        const info = SubscriptionService.getProductInfo(offerings.monthly);
        loadedPlans.push({
          id: 'monthly',
          title: 'Monthly',
          price: info.price,
          period: '/month',
          package: offerings.monthly,
        });
      }

      // Add annual plan
      if (offerings.annual) {
        const info = SubscriptionService.getProductInfo(offerings.annual);
        loadedPlans.push({
          id: 'yearly',
          title: 'Yearly',
          price: info.price,
          period: '/year',
          savings: info.pricePerMonth ? `$${info.pricePerMonth}/mo` : 'Save 33%',
          isPopular: true,
          package: offerings.annual,
        });
      }

      // Add lifetime plan if available
      if (offerings.lifetime) {
        const info = SubscriptionService.getProductInfo(offerings.lifetime);
        loadedPlans.push({
          id: 'lifetime',
          title: 'Lifetime',
          price: info.price,
          period: 'one-time',
          savings: 'Best Value',
          package: offerings.lifetime,
        });
      }

      setPlans(loadedPlans);
      if (loadedPlans.length > 0) {
        setSelectedPlan(loadedPlans.find(p => p.isPopular)?.id || loadedPlans[0].id);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Could not load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: 'sparkles',
      title: 'Unlimited Meditations',
      description: 'Access all QHHT-inspired soul journeys',
    },
    {
      icon: 'git-network',
      title: 'Unlimited Vision Boards',
      description: 'Create infinite parallel world visualizations',
    },
    {
      icon: 'mic',
      title: 'Voice Affirmations',
      description: 'Record custom affirmations in your voice',
    },
    {
      icon: 'list',
      title: 'Advanced Action Planner',
      description: 'AI-powered task generation and calendar sync',
    },
    {
      icon: 'book',
      title: 'Journal PDF Export',
      description: 'Export and share your soul journey',
    },
    {
      icon: 'cloud-upload',
      title: 'Cloud Backup',
      description: 'Sync your data across devices securely',
    },
    {
      icon: 'notifications',
      title: 'Priority Support',
      description: 'Get help manifesting your visions faster',
    },
    {
      icon: 'star',
      title: 'Early Access',
      description: 'Be first to try new soul-expanding features',
    },
  ];

  const handlePurchase = async () => {
    const selectedPlanData = plans.find((p) => p.id === selectedPlan);
    if (!selectedPlanData) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // If using real RevenueCat packages
    if (selectedPlanData.package) {
      try {
        setPurchasing(true);
        const success = await SubscriptionService.purchasePackage(selectedPlanData.package);

        if (success) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'Welcome to Premium! 🌟',
            'Your eternal soul thanks you for investing in your growth.',
            [{ text: 'Start Manifesting', onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error('Purchase error:', error);
      } finally {
        setPurchasing(false);
      }
    } else {
      // Mock purchase flow (fallback when RevenueCat not configured)
      Alert.alert(
        'Demo Mode',
        'RevenueCat is not configured. In production, this would process a real purchase.\n\nEnable premium access anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable Premium',
            onPress: async () => {
              await SubscriptionService.syncPremiumStatus();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleRestore = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      setPurchasing(true);
      const restored = await SubscriptionService.restorePurchases();

      if (restored) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary]}
            style={styles.iconGradient}
          >
            <Ionicons name="star" size={32} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.title}>Unlock Your Soul's Full Potential</Text>
          <Text style={styles.subtitle}>
            Join thousands manifesting their parallel world desires into reality
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => {
                setSelectedPlan(plan.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Card
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    {plan.savings && (
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    )}
                  </View>
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                {selectedPlan === plan.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View
                style={[styles.featureIcon, { backgroundColor: COLORS.primary + '20' }]}
              >
                <Ionicons name={feature.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Card style={styles.testimonialCard}>
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.secondary + '20']}
            style={styles.testimonialGradient}
          >
            <Ionicons name="heart" size={24} color={COLORS.secondary} />
            <Text style={styles.testimonialText}>
              "SoulSync Premium transformed my manifestation practice. Within 30 days, I
              landed my dream job that I visualized on my vision board. Worth every penny!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah K., Premium Member</Text>
          </LinearGradient>
        </Card>

        <Button
          title={
            purchasing
              ? 'Processing...'
              : `Start Premium - ${plans.find((p) => p.id === selectedPlan)?.price || ''}`
          }
          onPress={handlePurchase}
          style={styles.purchaseButton}
          icon={purchasing ? undefined : 'star'}
          disabled={purchasing}
        />

        {purchasing && (
          <ActivityIndicator
            size="small"
            color={COLORS.secondary}
            style={{ marginVertical: SPACING.sm }}
          />
        )}

        <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
          <Text style={[styles.restoreText, purchasing && { opacity: 0.5 }]}>
            Restore Previous Purchase
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Auto-renewable subscription. Cancel anytime. By subscribing, you agree to our
          Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: SIZES.font.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  planCard: {
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: SIZES.font.xs,
    fontWeight: 'bold',
    color: '#000',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    gap: 4,
  },
  planTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  savingsText: {
    fontSize: SIZES.font.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: SIZES.font.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  planPeriod: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  featuresContainer: {
    marginBottom: SPACING.xl,
  },
  featuresTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  featureDescription: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  testimonialCard: {
    marginBottom: SPACING.xl,
    padding: 0,
    overflow: 'hidden',
  },
  testimonialGradient: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  testimonialText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  testimonialAuthor: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
  },
  purchaseButton: {
    marginBottom: SPACING.md,
  },
  restoreText: {
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  disclaimer: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
});

export default PremiumUpgradeScreen;
