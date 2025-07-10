import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { theme } from '../../lib/theme';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (!formData.fullName || !formData.phone) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
    }

    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard after successful auth
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    });
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="h1" center style={styles.title}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text center color="gray.600" style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to your account to continue'
                : 'Join thousands of users shopping smarter'
              }
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              {mode === 'register' && (
                <>
                  <View style={styles.inputContainer}>
                    <Text variant="h6" style={styles.label}>
                      Full Name
                    </Text>
                    <Input
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChangeText={(text) => handleInputChange('fullName', text)}
                      leftIcon={<User color={theme.colors.gray[400]} size={20} />}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text variant="h6" style={styles.label}>
                      Phone Number
                    </Text>
                    <Input
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChangeText={(text) => handleInputChange('phone', text)}
                      keyboardType="phone-pad"
                      leftIcon={<Phone color={theme.colors.gray[400]} size={20} />}
                    />
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Text variant="h6" style={styles.label}>
                  Email Address
                </Text>
                <Input
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail color={theme.colors.gray[400]} size={20} />}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text variant="h6" style={styles.label}>
                  Password
                </Text>
                <Input
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                  leftIcon={<Lock color={theme.colors.gray[400]} size={20} />}
                  rightIcon={
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff color={theme.colors.gray[400]} size={20} />
                      ) : (
                        <Eye color={theme.colors.gray[400]} size={20} />
                      )}
                    </Button>
                  }
                />
              </View>

              {mode === 'register' && (
                <View style={styles.inputContainer}>
                  <Text variant="h6" style={styles.label}>
                    Confirm Password
                  </Text>
                  <Input
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    secureTextEntry={!showPassword}
                    leftIcon={<Lock color={theme.colors.gray[400]} size={20} />}
                  />
                </View>
              )}

              <Button
                onPress={handleSubmit}
                disabled={isLoading}
                style={styles.submitButton}
              >
                {isLoading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'
                }
              </Button>
            </View>
          </Card>

          <View style={styles.footer}>
            <Text center color="gray.600">
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '
              }
                             <TouchableOpacity onPress={toggleMode}>
                 <Text
                   color="primary.600"
                   bold
                   style={styles.link}
                 >
                   {mode === 'login' ? 'Sign up' : 'Sign in'}
                 </Text>
               </TouchableOpacity>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
    paddingTop: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    lineHeight: 24,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputContainer: {
    gap: theme.spacing.sm,
  },
  label: {
    marginBottom: 4,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
}); 