import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Heart, ShoppingBag, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { StoreCard } from '../../components/dashboard/StoreCard';
import { ApiMonitor } from '../../components/ui/api-monitor';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { getCurrentSession, isAuthenticated } from '../../lib/auth';
import { useProducts, useStores } from '../../lib/hooks';
import { theme } from '../../lib/theme';
import { useWishlist } from '../_layout';
import { ProductCard } from '../components/ui/product-card';
import { useCart } from './_layout';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, syncWithBackend: syncCart } = useCart(); // Get real addToCart

  // Only fetch data when user is authenticated
  const shouldFetchData = isUserAuthenticated;
  
  // Fetch recent stores (limit to 2 for dashboard) - only when authenticated
  const { data: storesResponse, loading: storesLoading } = useStores(
    { limit: 2, sortBy: 'rating' },
    shouldFetchData
  );
  
  // Extract stores array from API response
  const stores = storesResponse?.stores || [];
  
  // Fetch popular products (limit to 3) - only when authenticated  
  const { data: productsResponse, loading: productsLoading } = useProducts(
    { limit: 3, sortBy: 'storeRating' },
    shouldFetchData
  );
  
  // Extract products array from API response  
  const products = productsResponse?.products || [];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  // Debug logging for data fetching (only log key changes)
  React.useEffect(() => {
    if (isUserAuthenticated && (stores || products)) {
      console.log('✅ Data loaded - Stores:', stores?.length, 'Products:', products?.length);
    } else if (isUserAuthenticated && (storesLoading || productsLoading)) {
      console.log('🔄 Loading data...');
    } else if (!isUserAuthenticated) {
      console.log('❌ Not authenticated - data fetching disabled');
    }
  }, [isUserAuthenticated, stores, products, storesLoading, productsLoading]);

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product, 1); // Pass product and quantity
      showToast(`${product.name} added to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      showToast('Failed to add item to cart');
    }
  };

  const handleWishlistToggle = async (product: any) => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        showToast(`${product.name} removed from wishlist`);
      } else {
        await addToWishlist({
          itemId: product._id,
          name: product.name,
          price: product.price,
          image: product.image_url,
          unit: product.unit,
          storeName: product.storeName,
          storeId: product.storeId,
          category: product.category,
        });
        showToast(`${product.name} added to wishlist`);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update wishlist');
    }
  };

  // Check auth on screen focus (when navigating back from login)
  useFocusEffect(
    React.useCallback(() => {
      const checkAuthAndSync = async () => {
        await checkAuthAndLoadData();
        // The WishlistProvider now handles the initial sync.
        // If you need to manually re-sync on focus, you can call syncWithBackend() here.
        // For now, we'll rely on the initial load.
      };
      checkAuthAndSync();
    }, [])
  );

  const checkAuthAndLoadData = async () => {
    try {
      setAuthLoading(true);
      
      // Force a fresh session load from storage (important after login)
      const session = await getCurrentSession();
      console.log('Current session:', session); // Debug log
      
      // Check if user is authenticated based on fresh session
      const authenticated = !!session?.token;
      console.log('Authentication status:', authenticated); // Debug log
      
      setIsUserAuthenticated(authenticated);
      
      if (authenticated && session) {
        if (session.user) {
          setUser(session.user);
          console.log('User data loaded:', session.user); // Debug log
        } else {
          console.log('No user data in session'); // Debug log
        }
      } else {
        console.log('User not authenticated'); // Debug log
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsUserAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  // Debug function to test session manually
  const testSession = async () => {
    console.log('=== Manual Session Test ===');
    try {
      const session = await getCurrentSession();
      const authenticated = await isAuthenticated();
      console.log('Session:', session);
      console.log('Is Authenticated:', authenticated);
      console.log('=============================');
    } catch (error) {
      console.error('Session test error:', error);
    }
  };

  // Test API directly
  const testAPI = async () => {
    console.log('=== Direct API Test ===');
    try {
      const response = await fetch('https://vigorously-more-impala.ngrok-free.app/buyer/stores', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Direct API Response:', data);
      console.log('Status:', response.status);
    } catch (error) {
      console.error('Direct API Error:', error);
    }
    console.log('========================');
  };

  const quickActions = [
    {
      id: 'browse',
      title: 'Browse Stores',
      icon: ShoppingBag,
      color: '#4F46E5',
      description: 'Explore local stores',
    },
    {
      id: 'wishlist',
      title: 'My Wishlist',
      icon: Heart,
      color: '#EF4444',
      description: 'Saved items',
      onPress: () => router.push('/wishlist'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: '#F59E0B',
      description: 'Latest updates',
    },
    {
      id: 'trending',
      title: 'Trending',
      icon: TrendingUp,
      color: '#10B981',
      description: 'Popular items',
    },
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ApiMonitor />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ApiMonitor />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text variant="h4" style={styles.welcomeTitle}>
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Discover amazing products from local stores
          </Text>
        </View>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text variant="h6" style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} onPress={action.onPress}>
                <Card style={styles.actionCard}>
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <action.icon color={action.color} size={24} />
                  </View>
                  <Text variant="body" style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Show message if not authenticated */}
        {!isUserAuthenticated ? (
          <Card style={styles.section}>
            <Text style={styles.emptyText}>Please log in to see stores and products</Text>
            <View style={styles.buttonContainer}>
              <Button 
                onPress={checkAuthAndLoadData} 
                style={styles.retryButton}
              >
                Refresh Auth
              </Button>
              <Button 
                onPress={testSession} 
                variant="outline"
                style={styles.retryButton}
              >
                Debug Session
              </Button>
              <Button 
                onPress={testAPI} 
                variant="outline"
                style={styles.retryButton}
              >
                Test API
              </Button>
            </View>
          </Card>
        ) : (
          <>
            {/* Recent Stores */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="h6" style={styles.sectionTitle}>Recent Stores</Text>
                <Button 
                  variant="outline" 
                  size="sm"
                  onPress={() => {
                    console.log('Stores "View All" button pressed on mobile');
                    router.push('/stores');
                  }}
                >
                  View All
                </Button>
              </View>
              
              {storesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading stores...</Text>
                </View>
              ) : stores && stores.length > 0 ? (
                <View style={styles.storesContainer}>
                  {stores.slice(0, 2).map((store: any) => (
                    <StoreCard
                      key={store._id}
                      store={{
                        ...store,
                        description: store.storeAddress || 'No address provided',
                        imageUrl:
                          store.storeImgUrl ||
                          'https://images.unsplash.com/photo-1584008604?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                        deliveryTime: '30-45 min',
                        categories: store.categories || [],
                      }}
                      onPress={() =>
                        router.push({
                          pathname: '/stores/[storeId]',
                          params: { storeId: store._id },
                        })
                      }
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No stores available</Text>
              )}
            </Card>

            {/* Popular Products */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="h6" style={styles.sectionTitle}>
                  Popular Products
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push('./popular-items')}
                >
                  View All
                </Button>
              </View>

              {productsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading products...</Text>
                </View>
              ) : products && products.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.productsContainer}>
                    {products.slice(0, 3).map((product: any) => (
                      <View key={product._id} style={styles.productCardWrapper}>
                        <ProductCard
                           product={{...product, image: product.image_url}}
                           onAddToCart={() => handleAddToCart(product)}
                           onWishlistToggle={() => handleWishlistToggle(product)}
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>No products available</Text>
              )}
            </Card>
          </>
        )}
      </ScrollView>
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  welcomeSection: {
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    marginBottom: theme.spacing.sm,
    color: '#111827',
  },
  welcomeSubtitle: {
    color: '#6b7280',
    fontSize: theme.fontSize.base,
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: '#111827',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: theme.fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
  },
  storesContainer: {
    gap: theme.spacing.md,
  },
  productsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  productCardWrapper: {
    width: 170,
  },
  productCard: {
    width: 150,
    padding: 0, // Remove padding to allow image to fill edges
    overflow: 'hidden', // Ensure image corners are clipped
  },
  productImage: {
    width: '100%',
    height: 120, // Give the image a fixed height
    resizeMode: 'cover',
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  productName: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#4F46E5',
    marginBottom: theme.spacing.xs,
  },
  productStore: {
    fontSize: theme.fontSize.sm,
    color: '#6b7280',
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
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
    fontWeight: 'bold',
  },
}); 