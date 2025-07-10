import type { ViewProps } from 'react-native';
import { SafeAreaView as RNSafeAreaView, StyleSheet } from 'react-native';

export function SafeAreaView({ style, ...props }: ViewProps) {
  return <RNSafeAreaView style={[styles.safeArea, style]} {...props} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
}); 