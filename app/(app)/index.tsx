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
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { getCurrentSession, isAuthenticated } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { useProducts, useStores } from '../../lib/hooks';
import { theme } from '../../lib/theme';
import { useWishlist } from '../_layout';
import { AnimatedStoreCarousel } from '../components/ui/animated-store-carousel';
import { ProductCard } from '../components/ui/product-card';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, syncWithBackend: syncCart } = useCart();

  // Only fetch data when user is authenticated
  const shouldFetchData = isUserAuthenticated;
  
  // Fetch recent stores (limit to 2 for dashboard) - only when authenticated
  const { data: storesResponse, loading: storesLoading } = useStores(
    { limit: 3, sortBy: 'rating' },
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

  // Categories data (matching web version)
  const categories = [
    { name: "Groceries", icon: "🥑", id: "groceries" },
    { name: "Vegetables", icon: "🥕", id: "vegetables" },
    { name: "Fruits", icon: "🍎", id: "fruits" },
    { name: "Dairy", icon: "🥛", id: "dairy" },
    { name: "Snacks", icon: "🍪", id: "snacks" },
    { name: "Beverages", icon: "🥤", id: "beverages" },
    { name: "Personal Care", icon: "🧴", id: "personal-care" }
  ];

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

  const handleCategoryPress = (category: { name: string; id: string }) => {
    console.log('Category pressed:', category.name);
    // Navigate to category items page using href
    router.push({
      pathname: '/category/[categoryName]' as any,
      params: { categoryName: category.name }
    });
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

        {/* Quick Basket Creation */}
        <Card style={styles.section}>
          <TouchableOpacity 
            onPress={() => {
              console.log('🔧 Quick Basket Creation header pressed - navigating to baskets page');
              router.push('/baskets');
              showToast('Opening basket management...');
            }}
            style={styles.sectionHeader}
          >
            <Text variant="h6" style={styles.sectionTitle}>Quick Basket Creation</Text>
            <Text style={styles.expandIcon}>→</Text>
          </TouchableOpacity>
          
          <View style={styles.quickBasketContent}>
            <Text style={styles.basketDescription}>
              Create and manage your shopping baskets with detailed product information, quantities, and company preferences.
            </Text>
            <Button 
              onPress={() => {
                console.log('🔧 Get Started button pressed - navigating to baskets page');
                router.push('/baskets');
              }} 
              style={styles.getStartedButton}
            >
              <ShoppingBag size={16} color="white" />
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </Button>
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
                onPress={() => {
                  console.log('🔧 Testing direct navigation to baskets');
                  router.push('/baskets');
                }} 
                variant="outline"
                style={styles.retryButton}
              >
                Test Baskets
              </Button>
            </View>
          </Card>
        ) : (
          <>
            {/* Recent Stores - Animated Carousel */}
            <View style={styles.carouselSection}>
              <View style={styles.sectionHeader}>
                <Text variant="h6" style={styles.sectionTitle}>
                  Recent Stores
                </Text>
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
                <AnimatedStoreCarousel
                  stores={stores}
                  onStorePress={(storeId: string) =>
                    router.push({
                      pathname: '/stores/[storeId]' as any,
                      params: { storeId },
                    })
                  }
                />
              ) : (
                <Text style={styles.emptyText}>No stores available</Text>
              )}
            </View>

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
                           onPress={() => router.push(`/(app)/products/${product._id}`)}
                           isInWishlist={isInWishlist(product._id)}
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>No products available</Text>
              )}
            </Card>

            {/* Categories Section */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="h6" style={styles.sectionTitle}>
                  Shop by Category
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push('/categories' as any)}
                >
                  View All
                </Button>
              </View>

              <View style={styles.categoriesContainer}>
                {categories.map((category, index) => (
                  <Animated.View
                    key={category.id}
                    entering={FadeInDown.delay(index * 100).springify()}
                  >
                    <TouchableOpacity
                      style={styles.categoryCard}
                      onPress={() => handleCategoryPress(category)}
                      activeOpacity={0.7}
                    >
                      <Animated.View 
                        style={styles.categoryIconContainer}
                        entering={FadeInRight.delay(index * 150)}
                      >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                      </Animated.View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
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
    padding: 8, // Increased from theme.spacing.md for better spacing
    paddingTop: 20, // Extra top padding
  },
  welcomeSection: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 4, // Added horizontal padding
  },
  welcomeTitle: {
    marginBottom: theme.spacing.sm,
    color: '#111827',
  },
  welcomeSubtitle: {
    color: '#6b7280',
    fontSize: theme.fontSize.base,
  },
  carouselSection: {
    backgroundColor: '#eef2ff',
    paddingVertical: 16, // Reduced padding for better proportion
    paddingHorizontal: 8,
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 8, // Increased from 4 to pull away from edges more
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    marginHorizontal: 4, // Added horizontal margin
    borderRadius: 12, // Added border radius for consistency
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: 16, // Reduced from theme.spacing.lg for better spacing
    paddingVertical: 8, // Increased from 4
    marginHorizontal: 4, // Added margin to pull away from edges
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  categoryCard: {
    width: '30%', // 3 categories per row with gaps
    minWidth: 100,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
  },
  // New styles for Quick Basket
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickBasketContent: {
    paddingTop: theme.spacing.md,
  },
  addItemForm: {
    marginBottom: theme.spacing.md,
  },
  itemInput: {
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },
  addItemButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  itemsHeader: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: '#111827',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  basketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
    color: '#111827',
    marginBottom: theme.spacing.xs,
  },
  itemDescription: {
    fontSize: theme.fontSize.sm,
    color: '#6b7280',
    marginTop: theme.spacing.xs,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: theme.spacing.xs,
  },
  quantity: {
    fontSize: theme.fontSize.base,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: theme.spacing.sm,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  processBasketButton: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },
  processBasketText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  expandIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  basketDescription: {
    fontSize: theme.fontSize.sm,
    color: '#6b7280',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },
  getStartedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
}); 