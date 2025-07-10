import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  onPress,
  children,
  style,
  disabled,
}: ButtonProps) => {
  const buttonStyle = [
    styles.base,
    styles.sizes[size],
    styles.variants[variant].button,
    disabled && styles.disabled,
    style,
  ];
  const textStyle = [styles.textBase, styles.variants[variant].text];

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} disabled={disabled}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  } as ViewStyle,
  textBase: {
    fontWeight: '500',
  } as TextStyle,
  sizes: StyleSheet.create({
    sm: {
      height: 36,
      paddingHorizontal: 16,
    },
    md: {
      height: 40,
      paddingHorizontal: 16,
    },
    lg: {
      height: 44,
      paddingHorizontal: 32,
    },
  }),
  variants: {
    primary: StyleSheet.create({
      button: {
        backgroundColor: '#4F46E5', // primary-600
      },
      text: {
        color: '#FFFFFF',
      },
    }),
    secondary: StyleSheet.create({
      button: {
        backgroundColor: '#F3F4F6', // gray-100
      },
      text: {
        color: '#111827', // gray-900
      },
    }),
    outline: StyleSheet.create({
      button: {
        borderWidth: 1,
        borderColor: '#E5E7EB', // gray-200
        backgroundColor: '#FFFFFF',
      },
      text: {
        color: '#111827', // gray-900
      },
    }),
    ghost: StyleSheet.create({
      button: {
        backgroundColor: 'transparent',
      },
      text: {
        color: '#111827', // gray-900
      },
    }),
    danger: StyleSheet.create({
      button: {
        backgroundColor: '#DC2626', // red-600
      },
      text: {
        color: '#FFFFFF',
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  }
}; 