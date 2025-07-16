import { useRouter } from 'expo-router';
import { Heart, HelpCircle, LogOut, Settings, ShoppingBag, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { theme } from '../../lib/theme';

const profileOptions = [
  {
    title: 'My Orders',
    description: 'View your order history',
    icon: ShoppingBag,
    route: '/(app)/orders',
  },
  {
    title: 'Wishlist',
    description: 'Your saved items',
    icon: Heart,
    route: '/(app)/wishlist',
  },
  {
    title: 'Settings',
    description: 'Account and app settings',
    icon: Settings,
    route: '/settings',
  },
  {
    title: 'Help & Support',
    description: 'Get help and contact us',
    icon: HelpCircle,
    route: '/(app)/help-support',
  },
];

export default function Profile() {
  const router = useRouter();

  const handleOptionPress = (route: string) => {
    router.push(route as any);
  };

  const handleLogout = () => {
    // Handle logout logic
    router.replace('/auth');
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <User color={theme.colors.primary[600]} size={32} />
            </View>
            <View style={styles.userDetails}>
              <Text variant="h4" style={styles.userName}>
                John Doe
              </Text>
              <Text color="gray.600" style={styles.userEmail}>
                john.doe@example.com
              </Text>
              <Text color="gray.500" variant="caption" style={styles.userPhone}>
                +91 98765 43210
              </Text>
            </View>
          </View>
          <Button variant="outline" onPress={() => router.push('/profile/edit' as any)}>
            Edit Profile
          </Button>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <Card
              key={option.title}
              onPress={() => handleOptionPress(option.route)}
              style={styles.optionCard}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIcon}>
                  <option.icon color={theme.colors.primary[600]} size={24} />
                </View>
                <View style={styles.optionText}>
                  <Text variant="h6" style={styles.optionTitle}>
                    {option.title}
                  </Text>
                  <Text color="gray.600" variant="caption" style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <Card style={styles.actionCard}>
            <Text variant="h6" style={styles.actionTitle}>
              Account
            </Text>
                         <Button
               variant="ghost"
               onPress={handleLogout}
               style={StyleSheet.flatten([styles.actionButton, styles.logoutButton])}
             >
              <LogOut color={theme.colors.red[500]} size={20} />
              <Text color="red.500" style={styles.logoutText}>
                Sign Out
              </Text>
            </Button>
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text center color="gray.500" variant="caption">
            KiranaConnect v1.0.0
          </Text>
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
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    marginBottom: 4,
    lineHeight: 18,
  },
  userPhone: {
    lineHeight: 16,
  },
  optionsSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  optionCard: {
    padding: theme.spacing.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: 4,
  },
  optionDescription: {
    lineHeight: 16,
  },
  actionsSection: {
    padding: theme.spacing.lg,
  },
  actionCard: {
    padding: theme.spacing.lg,
  },
  actionTitle: {
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
  logoutButton: {
    paddingLeft: 0,
  },
  logoutText: {
    fontSize: theme.fontSize.base,
  },
  appInfo: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
}); 