import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { authAPI } from '../../lib/api';
import { getCurrentSession, saveSession } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role } = params as { role: 'buyer' | 'seller' };

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        // Login
        if (role === 'buyer') {
          response = await authAPI.buyerLogin({ email, password });
        } else {
          response = await authAPI.sellerLogin({ email, password });
        }
      } else {
        // Sign up
        if (role === 'buyer') {
          response = await authAPI.buyerSignUp({ name, email, password, phone });
        } else {
          response = await authAPI.sellerSignUp({ name, email, password, phone });
        }
      }

      if (response.data) {
        console.log('Login response data:', response.data); // Debug log
        
        // Save session and wait for it to complete
        await saveSession(role, response.data);
        
        // Verify session was saved
        const savedSession = await getCurrentSession();
        console.log('Saved session:', savedSession); // Debug log
        
        if (!savedSession) {
          throw new Error('Failed to save session');
        }
        
        // Navigate immediately without showing alert (which blocks execution)
        if (role === 'buyer') {
          router.replace('/(app)');
        } else {
          router.replace('/seller');
        }
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('Success', isLogin ? 'Logged in successfully!' : 'Account created successfully!');
        }, 100);
      } else {
        throw new Error('No session token received');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft color="#111827" size={24} />
      </TouchableOpacity>
      
      <Text style={styles.title}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Text>
      <Text style={styles.subtitle}>
        {`Log in or sign up as a ${role}`}
      </Text>

      {!isLogin && (
        <>
          <Input
            label="Full Name"
            icon={User}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Phone Number"
            icon={Phone}
            placeholder="123-456-7890"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </>
      )}

      <Input
        label="Email Address"
        icon={Mail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        icon={Lock}
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button size="lg" onPress={handleSubmit} style={{ marginTop: 16, width: '100%' }} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          isLogin ? 'Login' : 'Create Account'
        )}
      </Button>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton} disabled={loading}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Log In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 32,
    textTransform: 'capitalize',
  },
  toggleButton: {
    marginTop: 24,
  },
  toggleText: {
    color: '#4F46E5',
    fontWeight: '600',
  }
}); 