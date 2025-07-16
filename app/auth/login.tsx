import { Stack, useRouter } from 'expo-router';
import { Lock, Mail, Phone, Store, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { authAPI } from '../../lib/api';
import { getCurrentSession, saveSession } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  // Only buyer role
  const role = 'buyer';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Set the Stack.Screen title dynamically
  React.useEffect(() => {
    // This is a no-op, but we need to re-render to update the title
  }, [isLogin]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await authAPI.buyerLogin({ email, password });
      } else {
        response = await authAPI.buyerSignUp({ name, email, password, phone });
      }
      if (response.data) {
        await saveSession(role, response.data);
        const savedSession = await getCurrentSession();
        if (!savedSession) throw new Error('Failed to save session');
        router.replace('/(app)');
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
    <>
      <Stack.Screen options={{ title: isLogin ? 'Login' : 'Sign Up' }} />
      <View style={styles.container}>
        {/* KiranaConnect Logo and App Name */}
        <View style={styles.logoContainer}>
          <Store color="#FFFFFF" size={32} />
        </View>
        <Text style={styles.appTitle}>KiranaConnect</Text>
        <Text style={styles.pageTitle}>{isLogin ? 'Login' : 'Sign Up'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Log in to shop from local stores' : 'Create your account to start shopping'}
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
    </>
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
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pageTitle: {
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
  },
  toggleButton: {
    marginTop: 24,
  },
  toggleText: {
    color: '#4F46E5',
    fontWeight: '600',
  }
}); 