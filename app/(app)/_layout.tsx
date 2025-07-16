import { Tabs, useRouter, useSegments } from 'expo-router';
import {
    ArrowLeft,
    Bell,
    Heart,
    Home,
    Search,
    ShoppingCart,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    Image,
    Text as NativeText,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Text } from '../../components/ui/text';
import { useCart } from '../../lib/cart';
import { HeaderProvider, useHeader } from '../../lib/header-context';
import { theme } from '../../lib/theme';
import { useWishlist, WishlistProvider } from '../_layout';

// Custom Header Component
function CustomHeader() {
  const router = useRouter();
  const segments = useSegments();
  const { items: cartItems } = useCart();
  const wishlistContext = useWishlist();
  const { title: dynamicTitle } = useHeader(); // Use title from context
  const wishlistItems = wishlistContext?.items || [];
  
  // Determine if we're on the home page
  const isHomePage = segments.length === 1 && segments[0] === '(app)';
  
  // Get page title based on current segment
  const getPageTitle = () => {
    const lastSegment = segments[segments.length - 1];
    if (lastSegment === 'search') return 'Search Products';
    if (lastSegment === 'cart') return 'Shopping Cart';
    if (lastSegment === 'wishlist') return 'My Wishlist';
    if (lastSegment === 'profile') return 'Profile';
    if (lastSegment === 'notifications') return 'Notifications';
    if (lastSegment === 'stores') return 'All Stores';
    if (segments.some(segment => segment.includes('stores') && segment !== 'stores')) return 'Store Details';
    if (lastSegment === 'popular-items') return 'Popular Items';
    if (segments.some(segment => segment === 'products')) return 'Product Details';
    if (lastSegment === 'billing') return 'Checkout';
    return 'KiranaConnect';
  };

  const pageTitle = dynamicTitle || getPageTitle();
  const cartItemCount = cartItems?.length || 0;
  const wishlistItemCount = wishlistItems?.length || 0;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Left Side */}
        <View style={styles.headerLeft}>
          {!isHomePage ? (
            <>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
              >
                <ArrowLeft size={20} color={theme.colors.gray[700]} />
              </TouchableOpacity>
              <NativeText style={[styles.pageTitle, {fontWeight: '600', fontSize: 16}]} numberOfLines={1}>
                {pageTitle}
              </NativeText>
            </>
          ) : (
            <View style={styles.brandContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
              />
              <Text variant="h4" style={styles.brandText}>
                KiranaConnect
              </Text>
            </View>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.headerRight}>
          {/* Wishlist Icon */}
          <TouchableOpacity 
            onPress={() => router.push('/(app)/wishlist')}
            style={styles.iconButton}
          >
            <Heart size={20} color={theme.colors.gray[600]} />
            {wishlistItemCount > 0 && (
              <View style={styles.badge}>
                <NativeText style={styles.badgeText}>
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </NativeText>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart Icon */}
          <TouchableOpacity 
            onPress={() => router.push('/(app)/cart')}
            style={styles.iconButton}
          >
            <ShoppingCart size={20} color={theme.colors.gray[600]} />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <NativeText style={styles.badgeText}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </NativeText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function AppLayout() {
  return (
    <WishlistProvider>
      <HeaderProvider>
        <View style={{ flex: 1 }}>
          <CustomHeader />
          <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.colors.primary[600],
            tabBarInactiveTintColor: theme.colors.gray[400],
            tabBarStyle: {
              backgroundColor: theme.colors.white,
              borderTopWidth: 1,
              borderTopColor: theme.colors.gray[200],
              height: 60,
              paddingBottom: 5,
              paddingTop: 5,
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Home color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, size }) => (
                <Search color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color, size }) => (
                <Bell color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
            }}
          />
          
          {/* Hidden screens - accessible via navigation but not in tab bar */}
          <Tabs.Screen name="home" options={{ href: null }} />
          <Tabs.Screen name="stores/index" options={{ href: null }} />
          <Tabs.Screen name="stores/[storeId]" options={{ href: null }} />
          <Tabs.Screen name="popular-items/index" options={{ href: null }} />
          <Tabs.Screen name="products/[productId]" options={{ href: null }} />
          <Tabs.Screen name="billing" options={{ href: null }} />
          <Tabs.Screen name="orders" options={{ href: null }} />
          <Tabs.Screen name="auth" options={{ href: null }} />
          <Tabs.Screen name="cart" options={{ href: null }} />
          <Tabs.Screen name="wishlist" options={{ href: null }} />
          <Tabs.Screen name="baskets" options={{ href: null }} />
          <Tabs.Screen name="help-support" options={{ href: null }} />
          <Tabs.Screen name="category/[categoryName]" options={{ href: null }} />
          <Tabs.Screen name="categories/index" options={{ href: null }} />
        </Tabs>
      </View>
      </HeaderProvider>
    </WishlistProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.gray[200],
    paddingTop: 40, // Status bar height
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    height: 40,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 6,
    marginLeft: -4,
  },
  pageTitle: {
    color: theme.colors.gray[800],
    fontWeight: '600',
    fontSize: 16,
    flexShrink: 1, // Allow text to shrink if needed
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  brandText: {
    color: theme.colors.primary[600],
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.red[500],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 