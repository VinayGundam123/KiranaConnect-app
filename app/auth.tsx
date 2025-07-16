import { useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace({ pathname: '/auth/login', params: { role: 'buyer' } });
  }, [router]);
  return null;
}

interface RoleButtonProps {
  text: string;
  subtext: string;
  icon: LucideIcon;
  isSelected: boolean;
  onPress: () => void;
}

// A helper component for the role selection buttons
function RoleButton({ text, subtext, icon: Icon, isSelected, onPress }: RoleButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.roleButton, isSelected && styles.roleButtonSelected]}
      onPress={onPress}
    >
      <View style={styles.roleIconContainer}>
        <Icon color={isSelected ? '#4F46E5' : '#111827'} size={20} />
      </View>
      <View style={styles.roleTextContainer}>
        <Text style={styles.roleText}>{text}</Text>
        <Text style={styles.roleSubtext}>{subtext}</Text>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6', // Lighter background
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  roleButtonSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
}); 