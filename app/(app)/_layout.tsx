import axios from 'axios';
import { Tabs } from 'expo-router';
import {
  Home,
  Search,
  ShoppingCart,
  Store,
  User,
} from 'lucide-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authManager, getCurrentSession } from '../../lib/auth';
import { theme } from '../../lib/theme';
import { WishlistProvider } from '../_layout';

// --- Cart Context Implementation ---

// Interfaces
export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  storeId: string;
  storeName: string;
  category: string;
  addedAt?: number;
}

export interface AppliedCoupon {
  code: string;
  discountPercentage: number;
  discountAmount: number;
  appliedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  loading: boolean;
  appliedCoupon: AppliedCoupon | null;
  addToCart: (item: Omit<CartItem, 'quantity' | 'addedAt'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<any>;
  removeCoupon: () => void;
}

// Context Creation
const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = 'https://vigorously-more-impala.ngrok-free.app';
const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };

// Cart Provider Component
const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );

  const syncWithBackend = useCallback(async () => {
    setLoading(true);
    const session = await getCurrentSession();
    if (!session?.user?._id) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/buyer/cart/${session.user._id}`,
        { headers: NGROK_HEADER }
      );
      if (data && Array.isArray(data)) {
        const backendItems: CartItem[] = data.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt).getTime(),
        }));
        const newTotal = backendItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setItems(backendItems);
        setTotal(newTotal);
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // This effect runs once on mount and then listens for auth changes
  useEffect(() => {
    const unsubscribe = authManager.subscribe((session) => {
      console.log('Auth state changed, re-syncing cart...');
      syncWithBackend();
    });

    // Initial sync
    syncWithBackend();

    return () => {
      unsubscribe(); // Clean up the subscription
    };
  }, [syncWithBackend]);

  const addToCart = useCallback(
    async (item: any, quantity: number = 1) => {
      setLoading(true);
      const session = await getCurrentSession();
      if (!session?.user?._id) {
        console.error('No session found, cannot add to cart');
        setLoading(false);
        return;
      }

      try {
        const payload = {
          itemId: item._id || item.itemId,
          name: item.name,
          price: item.price,
          quantity: quantity,
          image: item.image_url || item.image,
          unit: item.unit,
          storeName: item.storeName,
          storeId: item.storeId,
          category: item.category,
        };
        
        console.log('Sending to cart:', payload);

        const response = await axios.post(
          `https://vigorously-more-impala.ngrok-free.app/buyer/cart/${session.user._id}`,
          payload,
          {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }
        );

        if (response.data.cart) {
          const { items: newItems, totalPrice: newTotal } = response.data.cart;
          setItems(newItems);
          setTotal(newTotal);
        }
      } catch (error: any) {
        console.error(
          'Failed to add item to cart:',
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      try {
        await axios.delete(
          `${API_BASE_URL}/buyer/cart/${session.user._id}/remove`,
          {
            data: { itemId },
            headers: NGROK_HEADER,
          }
        );
        await syncWithBackend();
      } catch (error) {
        console.error('Failed to remove item from cart:', error);
        throw error;
      }
    },
    [syncWithBackend]
  );

  const updateQuantity = useCallback(
    async (itemId: string, newQuantity: number) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      if (newQuantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      try {
        await axios.put(
          `${API_BASE_URL}/buyer/cart/${session.user._id}/quantity`,
          { itemId, newQuantity },
          { headers: NGROK_HEADER }
        );
        await syncWithBackend();
      } catch (error) {
        console.error('Failed to update quantity:', error);
        throw error;
      }
    },
    [syncWithBackend, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    const session = await getCurrentSession();
    if (!session?.user?._id) throw new Error('You must be logged in.');

    try {
      await axios.delete(
        `${API_BASE_URL}/buyer/cart/${session.user._id}/clear`,
        { headers: NGROK_HEADER }
      );
      await syncWithBackend();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const applyCoupon = useCallback(async (couponCode: string) => {
    const session = await getCurrentSession();
    if (!session?.user?._id) throw new Error('You must be logged in.');

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/buyer/cart/${session.user._id}/coupons/validate`,
        { couponCode: couponCode.trim().toUpperCase() },
        { headers: NGROK_HEADER }
      );

      if (data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountPercentage: data.coupon.discountPercentage,
          discountAmount: data.coupon.discountAmount,
          appliedAt: new Date(),
        });
      }
      return data;
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      setAppliedCoupon(null);
      throw error;
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        loading,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncWithBackend, // Already here, just confirming
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// --- End Cart Context ---

export default function AppLayout() {
  return (
    <WishlistProvider>
      <CartProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.colors.primary[600],
            tabBarInactiveTintColor: theme.colors.gray[400],
            tabBarStyle: {
              backgroundColor: theme.colors.white,
              borderTopWidth: 1,
              borderTopColor: theme.colors.gray[200],
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Home color={color} size={size} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="stores"
            options={{
              title: 'Stores',
              tabBarIcon: ({ color, size }) => (
                <Store color={color} size={size} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, size }) => (
                <Search color={color} size={size} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: 'Cart',
              tabBarIcon: ({ color, size }) => (
                <ShoppingCart color={color} size={size} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="home"
            options={{
              href: null, // Hide from tabs
            }}
          />
          <Tabs.Screen
            name="popular-items"
            options={{
              href: null, // Hide from tabs
            }}
          />
        </Tabs>
      </CartProvider>
    </WishlistProvider>
  );
} 