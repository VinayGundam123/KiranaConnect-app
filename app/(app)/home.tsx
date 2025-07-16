import axios from 'axios';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Clock,
  Star,
  Store,
  Truck,
  Users
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { theme } from '../../lib/theme';
import { useWishlist } from '../_layout';
import { ProductCard } from '../components/ui/product-card';

const features = [
  {
    icon: Clock,
    title: 'Smart Subscriptions',
    description:
      'Set up recurring deliveries for your essentials and never run out.',
  },
  {
    icon: Users,
    title: 'Shared Deliveries',
    description:
      'Split delivery costs with neighbors and reduce environmental impact.',
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
    image:
      'https://images.unsplash.com/photo-1584008604?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    deliveryTime: 'Delivers in 30 mins',
  },
  {
    id: '2',
    name: 'Krishna Kirana Store 2',
    description: 'Quality products you can trust',
    image:
      'https://images.unsplash.com/photo-1584008605?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    deliveryTime: 'Delivers in 25 mins',
  },
  {
    id: '3',
    name: 'Krishna Kirana Store 3',
    description: 'Your friendly neighborhood store',
    image:
      'https://images.unsplash.com/photo-1584008606?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    deliveryTime: 'Delivers in 45 mins',
  },
];

export default function Home() {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const response = await axios.get(
          'https://vigorously-more-impala.ngrok-free.app/buyer/products?limit=4&sortBy=storeRating',
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const mappedItems = response.data.products.map((item: any) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          image:
            item.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
          storeName: item.storeName,
          storeId: item.storeId,
          category: item.category || 'General',
          unit: item.unit,
        }));
        setPopularItems(mappedItems);
      } catch (error) {
        console.error('Failed to fetch popular items:', error);
      }
    };
    fetchPopularItems();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWishlistToggle = async (item: any) => {
    try {
      if (isInWishlist(item._id)) {
        await removeFromWishlist(item._id);
        showToast(`${item.name} removed from wishlist`);
      } else {
        await addToWishlist({
          ...item,
          itemId: item._id,
          storeId: item.storeId,
          storeName: item.storeName,
        });
        showToast(`${item.name} added to wishlist`);
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      showToast('Failed to update wishlist');
    }
  };

  const handleAddToCart = (item: any) => {
    showToast(`${item.name} added to cart`);
  };

  const handleGetStarted = () => {
    router.push('/auth' as any);
  };

  const handleStorePress = (storeId: string) => {
    router.push(`/stores/${storeId}` as any);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}` as any);
  };

  const handleViewAllItems = () => {
    router.push('/popular-items' as any);
  };

  return (
    <SafeAreaView>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Popular Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2" style={styles.sectionTitle}>
              Popular Items
            </Text>
            <TouchableOpacity onPress={handleViewAllItems}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text center color="gray.600" style={styles.sectionDescription}>
            Check out what's trending from your local stores.
          </Text>
          <View style={styles.itemsGrid}>
            {popularItems.slice(0, 4).map(item => (
              <View key={item._id} style={styles.gridItem}>
                <ProductCard
                  product={item}
                  onWishlistToggle={() => handleWishlistToggle(item)}
                  onAddToCart={() => handleAddToCart(item)}
                  onPress={() => handleProductPress(item._id)}
                  isInWishlist={isInWishlist(item._id)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Store Showcase */}
        <View style={[styles.section, styles.storeSection]}>
          <Text variant="h2" center style={styles.sectionTitle}>
            Featured Stores
          </Text>
          <Text center color="gray.600" style={styles.sectionDescription}>
            Discover quality products from trusted local stores
          </Text>
          
          <View style={styles.storesContainer}>
            {mockStores.map((store) => (
              <Card
                key={store.id}
                onPress={() => handleStorePress(store.id)}
                style={styles.storeCard}
              >
                <Image source={{ uri: store.image }} style={styles.storeImage} />
                <View style={styles.storeContent}>
                  <View style={styles.storeHeader}>
                    <Text variant="h5" style={styles.storeName}>
                      {store.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Star color={theme.colors.yellow[400]} size={16} />
                      <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                  </View>
                  <Text color="gray.600" style={styles.storeDescription}>
                    {store.description}
                  </Text>
                  <View style={styles.deliveryContainer}>
                    <Clock color={theme.colors.gray[500]} size={16} />
                    <Text color="gray.500" style={styles.deliveryText}>
                      {store.deliveryTime}
                    </Text>
                  </View>
                </View>
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

        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
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
  storeSection: {
    backgroundColor: theme.colors.gray[50],
  },
  storesContainer: {
    gap: theme.spacing.md,
  },
  storeCard: {
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },
  storeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  storeContent: {
    padding: theme.spacing.md,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  storeName: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  ratingText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  storeDescription: {
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: theme.fontSize.sm,
  },
  ctaButtonContainer: {
    alignItems: 'center',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemWrapper: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  itemContent: {
    padding: theme.spacing.md,
  },
  itemName: {
    fontWeight: '600',
    fontSize: theme.fontSize.base,
  },
  itemStore: {
    color: theme.colors.gray[500],
    fontSize: theme.fontSize.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  itemPrice: {
    fontWeight: 'bold',
    fontSize: theme.fontSize.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gridItem: {
    width: '48%',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: 'white',
  },
}); 