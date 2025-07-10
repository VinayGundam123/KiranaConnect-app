import { useRouter } from 'expo-router';
import { ArrowRight, Clock, Store, Truck, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { SafeAreaView } from '../components/ui/safe-area-view';
import { Text } from '../components/ui/text';
import { theme } from '../lib/theme';

const features = [
  {
    icon: Clock,
    title: 'Smart Subscriptions',
    description: 'Set up recurring deliveries for your essentials and never run out.',
  },
  {
    icon: Users,
    title: 'Shared Deliveries', 
    description: 'Split delivery costs with neighbors and reduce environmental impact.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your groceries delivered within hours, not days.',
  },
];

const mockStores = [
  {
    id: '1',
    name: 'Krishna Kirana Store 1',
    description: 'Fresh groceries and daily essentials',
    image: 'https://images.unsplash.com/photo-1584008604?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    deliveryTime: 'Delivers in 30 mins',
  },
  {
    id: '2', 
    name: 'Krishna Kirana Store 2',
    description: 'Quality products you can trust',
    image: 'https://images.unsplash.com/photo-1584008605?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    deliveryTime: 'Delivers in 25 mins',
  },
];

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text variant="h1" color="white" style={styles.heroTitle}>
              Your Local Kirana Store,{' '}
              <Text variant="h1" color={theme.colors.primary[200]}>
                Now Digital
              </Text>
            </Text>
            <Text color={theme.colors.primary[100]} style={styles.heroDescription}>
              Subscribe to your favorite stores, share deliveries with neighbors, and shop smarter with AI-powered recommendations.
            </Text>
            <View style={styles.heroButtonContainer}>
              <Button onPress={handleGetStarted} style={styles.heroButton}>
                Get Started
                <ArrowRight color={theme.colors.primary[600]} size={20} />
              </Button>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Users color={theme.colors.primary[200]} size={20} />
                <Text color={theme.colors.primary[100]} style={styles.statText}>
                  10k+ Users
                </Text>
              </View>
              <View style={styles.statItem}>
                <Store color={theme.colors.primary[200]} size={20} />
                <Text color={theme.colors.primary[100]} style={styles.statText}>
                  500+ Stores
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text variant="h2" center style={styles.sectionTitle}>
            Everything you need to shop smarter
          </Text>
          <Text center color="gray.600" style={styles.sectionDescription}>
            Connect with local stores, share deliveries, and save more with smart subscriptions.
          </Text>
          
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Card key={feature.title} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <feature.icon color={theme.colors.primary[600]} size={24} />
                </View>
                <Text variant="h5" style={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text color="gray.600" style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.section}>
          <Text variant="h2" center style={styles.sectionTitle}>
            Ready to start shopping smarter?
          </Text>
          <View style={styles.ctaButtonContainer}>
            <Button variant="secondary" onPress={handleGetStarted}>
              Create an account
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  heroSection: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing['2xl'],
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroDescription: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  heroButtonContainer: {
    marginBottom: theme.spacing.xl,
  },
  heroButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statText: {
    fontSize: theme.fontSize.sm,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaButtonContainer: {
    alignItems: 'center',
  },
}); 