import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from '../components/ui/safe-area-view';
import { Text } from '../components/ui/text';
import { isAuthenticated } from '../lib/auth';
import { theme } from '../lib/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state
    const checkAuthState = async () => {
      console.log('Starting authentication check...');
      try {
        // Add your auth check logic here
        // For now, we'll simulate and redirect to onboarding/home
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user is authenticated
        console.log('Calling isAuthenticated...');
        const userIsAuthenticated = await isAuthenticated(); // Replace with actual auth check
        console.log('isAuthenticated result:', userIsAuthenticated);
        
        if (userIsAuthenticated) {
          console.log('User is authenticated, redirecting to /(app)');
          router.replace('/(app)');
        } else {
          console.log('User is not authenticated, redirecting to /home');
          router.replace('/home');
        }
      } catch (error) {
        // Handle error, maybe redirect to error page
        console.error('Error during authentication check:', error);
        console.log('Redirecting to /home due to error.');
        router.replace('/home');
      }
    };

    checkAuthState();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h2" center style={styles.title}>
          KiranaConnect
        </Text>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary[600]} 
          style={styles.loader}
        />
        <Text center color="gray.600" style={styles.subtitle}>
          Loading your shopping experience...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.primary[600],
  },
  loader: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    lineHeight: 20,
  },
});
