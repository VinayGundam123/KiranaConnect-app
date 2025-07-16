import axios from 'axios';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { authManager, getCurrentSession } from '../lib/auth';
import { DataProvider } from '../lib/data-context';

// Wishlist Context Implementation
export interface WishlistItem {
  itemId: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  storeName: string;
  storeId: string;
  addedAt: string;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (itemId: string) => boolean;
  syncWithBackend: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const API_BASE_URL = 'https://vigorously-more-impala.ngrok-free.app';
const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };

const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const syncWithBackend = useCallback(async () => {
    setLoading(true);
    const session = await getCurrentSession();
    if (!session?.user?._id) {
      setItems([]); // Clear items if not logged in
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/buyer/wishlist/${session.user._id}`,
        { headers: NGROK_HEADER }
      );
      if (response.data.success && response.data.wishlist) {
        setItems(response.data.wishlist);
      }
    } catch (error) {
      console.error('Failed to sync wishlist with backend:', error);
    }
    setLoading(false);
  }, []);

  // This effect runs once on mount and then listens for auth changes
  useEffect(() => {
    const unsubscribe = authManager.subscribe((session) => {
      console.log('Auth state changed, re-syncing wishlist...');
      syncWithBackend();
    });

    // Initial sync
    syncWithBackend();

    return () => {
      unsubscribe(); // Clean up the subscription
    };
  }, [syncWithBackend]);

  const isInWishlist = (itemId: string) => {
    return items.some(item => item.itemId === itemId);
  };

  const addToWishlist = useCallback(
    async (item: Omit<WishlistItem, 'addedAt'>) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      // Check if item is already in wishlist to prevent duplicates
      if (isInWishlist(item.itemId)) {
        console.log('Item already in wishlist, skipping add operation');
        return;
      }

      try {
        await axios.post(
          `${API_BASE_URL}/buyer/wishlist/${session.user._id}/add`,
          item,
          { headers: NGROK_HEADER }
        );
        await syncWithBackend();
      } catch (error) {
        console.error('Failed to add item to wishlist:', error);
        throw new Error('Failed to add item. Please try again.');
      }
    },
    [syncWithBackend, isInWishlist]
  );

  const removeFromWishlist = useCallback(
    async (itemId: string) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      try {
        await axios.delete(
          `${API_BASE_URL}/buyer/wishlist/${session.user._id}/remove/${itemId}`,
          { headers: NGROK_HEADER }
        );
        await syncWithBackend();
      } catch (error) {
        console.error('Failed to remove item from wishlist:', error);
        throw new Error('Failed to remove item. Please try again.');
      }
    },
    [syncWithBackend]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        syncWithBackend,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Export WishlistProvider for use in nested layouts
export { WishlistProvider };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <DataProvider>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="seller" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast />
    </DataProvider>
  );
}
