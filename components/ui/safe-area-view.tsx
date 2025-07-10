import React from 'react';
import { SafeAreaView as RNSafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme';

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export function SafeAreaView({ 
  children, 
  style,
  backgroundColor = theme.colors.white,
  ...props 
}: SafeAreaViewProps) {
  return (
    <RNSafeAreaView style={[styles.container, { backgroundColor }, style]} {...props}>
      {children}
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 