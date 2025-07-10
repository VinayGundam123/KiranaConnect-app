import React from 'react';
import { TextStyle, TouchableOpacity } from 'react-native';
import { Text } from './text';

interface TouchableTextProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'small';
  color?: string;
  center?: boolean;
  bold?: boolean;
  style?: TextStyle;
}

export function TouchableText({ 
  children, 
  onPress,
  variant = 'body', 
  color, 
  center = false, 
  bold = false,
  style,
  ...props 
}: TouchableTextProps) {
  return (
    <TouchableOpacity onPress={onPress} {...props}>
      <Text 
        variant={variant}
        color={color}
        center={center}
        bold={bold}
        style={style}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
} 