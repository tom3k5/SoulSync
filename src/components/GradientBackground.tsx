import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = [COLORS.background, COLORS.surface] as const,
}) => {
  return (
    <LinearGradient colors={colors as any} style={styles.gradient}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
