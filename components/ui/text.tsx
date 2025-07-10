import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../lib/theme';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'small';
  color?: keyof typeof theme.colors | string;
  center?: boolean;
  bold?: boolean;
  style?: TextStyle;
}

export function Text({ 
  children, 
  variant = 'body', 
  color = 'gray.900', 
  center = false, 
  bold = false,
  style,
  ...props 
}: TextProps) {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return { fontSize: theme.fontSize['4xl'], fontWeight: theme.fontWeight.bold };
      case 'h2':
        return { fontSize: theme.fontSize['3xl'], fontWeight: theme.fontWeight.bold };
      case 'h3':
        return { fontSize: theme.fontSize['2xl'], fontWeight: theme.fontWeight.semibold };
      case 'h4':
        return { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.semibold };
      case 'h5':
        return { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.medium };
      case 'h6':
        return { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.medium };
      case 'caption':
        return { fontSize: theme.fontSize.sm, color: theme.colors.gray[600] };
      case 'small':
        return { fontSize: theme.fontSize.xs, color: theme.colors.gray[500] };
      default:
        return { fontSize: theme.fontSize.base };
    }
  };

  const getColor = () => {
    if (color.includes('.')) {
      const [colorName, shade] = color.split('.');
      return (theme.colors as any)[colorName]?.[shade] || color;
    }
    return (theme.colors as any)[color] || color;
  };

  const baseStyle = getVariantStyle();
  const textStyle: TextStyle = {
    ...baseStyle,
    color: getColor(),
    textAlign: center ? 'center' : 'left',
    fontWeight: bold ? theme.fontWeight.bold : baseStyle.fontWeight,
    ...style,
  };

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  // Additional base styles if needed
}); 