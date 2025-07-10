import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  onRightIconPress?: () => void;
}

export const Input = ({ 
  label, 
  icon: Icon, 
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props 
}: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {(Icon || leftIcon) && (
          <View style={styles.iconContainer}>
            {Icon && <Icon color="#9CA3AF" size={20} />}
            {leftIcon}
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
}); 