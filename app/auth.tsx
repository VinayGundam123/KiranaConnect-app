import { useRouter } from 'expo-router';
import { LucideIcon, Store, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackendStatus } from '../components/ui/backend-status';
import { Button } from '../components/ui/button';
import { healthAPI } from '../lib/api';

export default function AuthScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const handleContinue = () => {
    router.push({ pathname: '/auth/login', params: { role } });
  };

  const testBackendConnection = async () => {
    try {
      Alert.alert('Testing...', 'Checking backend connection');
      await healthAPI.check();
      Alert.alert('Success!', 'Backend is running and accessible');
    } catch (error: any) {
      Alert.alert(
        'Backend Error', 
        `Cannot connect to backend server at localhost:5000\n\nError: ${error.message}\n\nMake sure your backend server is running!`
      );
    }
  };

  return (
    <View style={styles.container}>
      <BackendStatus />
      <View style={styles.logoContainer}>
        <Store color="#FFFFFF" size={32} />
      </View>
      <Text style={styles.title}>KiranaConnect</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Choose your role</Text>
        <Text style={styles.cardSubtitle}>
          Select how you'll be using KiranaConnect
        </Text>

        {/* Role Selection Buttons */}
        <View style={{width: '100%'}}>
          <RoleButton
            text="I'm a Buyer"
            subtext="Shop from local stores"
            icon={User}
            isSelected={role === 'buyer'}
            onPress={() => setRole('buyer')}
          />
          <RoleButton
            text="I'm a Seller"
            subtext="List your store and manage orders"
            icon={Store}
            isSelected={role === 'seller'}
            onPress={() => setRole('seller')}
          />
        </View>

        <Button size="lg" onPress={handleContinue} style={{marginTop: 16}}>
          Continue
        </Button>

        {/* Test Backend Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onPress={testBackendConnection} 
          style={{marginTop: 8, width: '100%'}}
        >
          Test Backend Connection
        </Button>
      </View>
    </View>
  );
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