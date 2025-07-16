import { Stack, useRouter } from 'expo-router';
import { ExternalLink, HelpCircle, Mail, MessageCircle, Phone } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { useHeader } from '../../lib/header-context';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();

  useEffect(() => {
    setTitle('Help & Support');
    
    return () => {
      setTitle(null);
    };
  }, [setTitle]);

  const handleContactSales = () => {
    Alert.alert(
      'Contact Sales',
      'Choose how you\'d like to contact our sales team:',
      [
        {
          text: 'Phone Call',
          onPress: () => Linking.openURL('tel:+1234567890'),
        },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:sales@kiranaconnect.com?subject=Sales Inquiry'),
        },
        {
          text: 'WhatsApp',
          onPress: () => Linking.openURL('https://wa.me/1234567890?text=Hi, I need help with KiranaConnect'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleHelpCenter = () => {
    Alert.alert(
      'Help Center',
      'You\'ll be redirected to our comprehensive help center with FAQs, tutorials, and guides.',
      [
        {
          text: 'Go to Help Center',
          onPress: () => {
            // In a real app, this would open the help center URL
            Alert.alert('Help Center', 'Help center would open here. This is a demo.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const quickHelpOptions = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: HelpCircle,
      onPress: () => Alert.alert('FAQ', 'FAQ section would open here'),
    },
    {
      id: 'orders',
      title: 'Order Issues',
      description: 'Help with orders, delivery, and returns',
      icon: Phone,
      onPress: () => Alert.alert('Order Help', 'Order support would open here'),
    },
    {
      id: 'account',
      title: 'Account & Billing',
      description: 'Manage your account and billing questions',
      icon: Mail,
      onPress: () => Alert.alert('Account Help', 'Account support would open here'),
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'App issues and technical problems',
      icon: MessageCircle,
      onPress: () => Alert.alert('Technical Support', 'Technical support would open here'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>Contact us</Text>
          <Text style={styles.subtitle}>
            We're here to help! Choose the best way to get in touch with our team.
          </Text>
        </View>

        {/* Main Contact Options */}
        <View style={styles.mainOptions}>
          {/* Sales Contact */}
          <Card style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Phone size={32} color="#4F46E5" />
              </View>
            </View>
            <Text variant="h6" style={styles.cardTitle}>
              Talk to a member of our Sales team
            </Text>
            <Text style={styles.cardDescription}>
              We'll help you find the right products and pricing for your business.
            </Text>
            <Button 
              onPress={handleContactSales}
              style={styles.primaryButton}
            >
              Contact Sales
            </Button>
          </Card>

          {/* Support Contact */}
          <Card style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <HelpCircle size={32} color="#4F46E5" />
              </View>
            </View>
            <Text variant="h6" style={styles.cardTitle}>
              Product and account support
            </Text>
            <Text style={styles.cardDescription}>
              Our help center is fresh and always open for business. If you can't find the answer you're looking for, we're here to lend a hand.
            </Text>
            <Button 
              onPress={handleHelpCenter}
              style={styles.secondaryButton}
              variant="outline"
            >
              Go to the help center
            </Button>
          </Card>
        </View>

        {/* Quick Help Section */}
        <View style={styles.quickHelpSection}>
          <Text variant="h5" style={styles.sectionTitle}>Quick Help</Text>
          <Text style={styles.sectionSubtitle}>
            Find quick solutions to common issues
          </Text>
          
          <View style={styles.quickHelpGrid}>
            {quickHelpOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.quickHelpCard}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.quickHelpIcon}>
                  <option.icon size={24} color="#4F46E5" />
                </View>
                <Text style={styles.quickHelpTitle}>{option.title}</Text>
                <Text style={styles.quickHelpDescription}>{option.description}</Text>
                <ExternalLink size={16} color="#6B7280" style={styles.externalIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <Card style={styles.emergencyCard}>
          <Text variant="h6" style={styles.emergencyTitle}>Need Immediate Help?</Text>
          <Text style={styles.emergencyDescription}>
            For urgent issues with orders or account access, contact us directly:
          </Text>
          <View style={styles.emergencyContacts}>
            <TouchableOpacity 
              style={styles.emergencyContact}
              onPress={() => Linking.openURL('tel:+1234567890')}
            >
              <Phone size={16} color="#EF4444" />
              <Text style={styles.emergencyContactText}>Emergency Hotline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.emergencyContact}
              onPress={() => Linking.openURL('mailto:urgent@kiranaconnect.com')}
            >
              <Mail size={16} color="#EF4444" />
              <Text style={styles.emergencyContactText}>Urgent Email</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.infoCard}>
          <Text variant="h6" style={styles.infoTitle}>Contact Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Customer Support:</Text>
            <Text style={styles.infoValue}>support@kiranaconnect.com</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sales Inquiries:</Text>
            <Text style={styles.infoValue}>sales@kiranaconnect.com</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Business Hours:</Text>
            <Text style={styles.infoValue}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Weekend Support:</Text>
            <Text style={styles.infoValue}>Saturday - Sunday: 10:00 AM - 4:00 PM</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  mainOptions: {
    flexDirection: 'row',
    // gap: 16, // Removed for React Native Web compatibility
    marginBottom: 32,
  },
  contactCard: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 8, // Added margin instead of gap
  },
  cardHeader: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDescription: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
  },
  secondaryButton: {
    borderColor: '#7C3AED',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
  },
  quickHelpSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
  },
  quickHelpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap: 12, // Removed for React Native Web compatibility
  },
  quickHelpCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    marginBottom: 12, // Added margin instead of gap
    marginHorizontal: 6, // Added margin for horizontal spacing
  },
  quickHelpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickHelpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  quickHelpDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  externalIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  emergencyTitle: {
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  emergencyDescription: {
    color: '#991B1B',
    fontSize: 14,
    marginBottom: 16,
  },
  emergencyContacts: {
    flexDirection: 'row',
    // gap: 16, // Removed for React Native Web compatibility
  },
  emergencyContact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginRight: 16, // Added margin instead of gap
  },
  emergencyContactText: {
    marginLeft: 8,
    color: '#DC2626',
    fontWeight: '500',
    fontSize: 12,
  },
  infoCard: {
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
}); 