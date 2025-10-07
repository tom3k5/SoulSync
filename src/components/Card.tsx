import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  hapticFeedback?: boolean;
}

const Card: React.FC<CardProps> = ({ children, onPress, style, hapticFeedback = true }) => {
  const handlePress = () => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.card, style]}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
});

export default Card;
