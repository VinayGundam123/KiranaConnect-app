import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: keyof typeof theme.spacing;
  margin?: keyof typeof theme.spacing;
  backgroundColor?: string;
  borderRadius?: keyof typeof theme.borderRadius;
  shadow?: boolean;
}

export function Card({ 
  children, 
  style,
  onPress,
  padding = 'md',
  margin,
  backgroundColor = theme.colors.white,
  borderRadius = 'lg',
  shadow = true,
  ...props 
}: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: theme.borderRadius[borderRadius],
    padding: theme.spacing[padding],
    ...(margin && { margin: theme.spacing[margin] }),
    ...(shadow && styles.shadow),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // Use boxShadow for web, shadowColor for native
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 