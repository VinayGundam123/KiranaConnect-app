import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { authManager, getCurrentSession } from './auth';

// --- Interfaces (re-using from your context implementation) ---
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

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  appliedCoupon: AppliedCoupon | null;
}

// --- Module-Level State ---
let state: CartState = {
  items: [],
  total: 0,
  loading: true,
  appliedCoupon: null,
};

// --- Listener System ---
type Listener = (state: CartState) => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(state));
};

// --- API Configuration ---
const API_BASE_URL = 'https://vigorously-more-impala.ngrok-free.app';
const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };

// --- State Mutators and Actions ---
const setState = (newState: Partial<CartState>) => {
  state = { ...state, ...newState };
  notifyListeners();

  // Prevent AsyncStorage calls on the server
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return;
  }

  // Persist only items and coupon, as total is derived and loading is transient
  AsyncStorage.setItem('cart_items', JSON.stringify(state.items));
  if (state.appliedCoupon) {
    AsyncStorage.setItem('cart_coupon', JSON.stringify(state.appliedCoupon));
  } else {
    AsyncStorage.removeItem('cart_coupon');
  }
};

export const syncWithBackend = async () => {
  setState({ loading: true });
  const session = await getCurrentSession();

  if (!session?.user?._id) {
    setState({ items: [], total: 0, loading: false });
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
      setState({ items: backendItems, total: newTotal, loading: false });
    } else {
      setState({ items: [], total: 0, loading: false });
    }
  } catch (error) {
    console.error('Failed to sync cart with backend:', error);
    setState({ items: [], total: 0, loading: false });
  }
};

export const addToCart = async (item: any, quantity: number = 1) => {
  const session = await getCurrentSession();
  if (!session?.user?._id) {
    console.error('No session found, cannot add to cart');
    return;
  }
  setState({ loading: true });
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
    const { data } = await axios.post(
      `${API_BASE_URL}/buyer/cart/${session.user._id}`,
      payload,
      { headers: NGROK_HEADER }
    );
    if (data.cart) {
      const { items: newItems, totalPrice: newTotal } = data.cart;
      setState({ items: newItems, total: newTotal, loading: false });
    }
  } catch (error: any) {
    console.error('Failed to add item to cart:', error.response?.data || error.message);
    setState({ loading: false }); // Revert loading state on error
  }
};

export const removeFromCart = async (itemId: string) => {
    const session = await getCurrentSession();
    if (!session?.user?._id) throw new Error('You must be logged in.');

    await axios.delete(
        `${API_BASE_URL}/buyer/cart/${session.user._id}/remove`,
        { data: { itemId }, headers: NGROK_HEADER }
    );
    await syncWithBackend();
};

export const updateQuantity = async (itemId: string, newQuantity: number) => {
    const session = await getCurrentSession();
    if (!session?.user?._id) throw new Error('You must be logged in.');

    if (newQuantity <= 0) {
        await removeFromCart(itemId);
        return;
    }

    await axios.put(
        `${API_BASE_URL}/buyer/cart/${session.user._id}/quantity`,
        { itemId, newQuantity },
        { headers: NGROK_HEADER }
    );
    await syncWithBackend();
};

export const clearCart = async () => {
    const session = await getCurrentSession();
    if (!session?.user?._id) throw new Error('You must be logged in.');

    await axios.delete(
      `${API_BASE_URL}/buyer/cart/${session.user._id}/clear`,
      { headers: NGROK_HEADER }
    );
    await syncWithBackend();
};

export const applyCoupon = async (couponCode: string) => {
    const session = await getCurrentSession();
    if (!session?.user?._id) throw new Error('You must be logged in.');

    const { data } = await axios.post(
        `${API_BASE_URL}/buyer/cart/${session.user._id}/coupons/validate`,
        { couponCode: couponCode.trim().toUpperCase() },
        { headers: NGROK_HEADER }
    );

    if (data.valid) {
        setState({
            appliedCoupon: {
                code: data.coupon.code,
                discountPercentage: data.coupon.discountPercentage,
                discountAmount: data.coupon.discountAmount,
                appliedAt: new Date(),
            }
        });
    }
    return data;
};

export const removeCoupon = () => {
    setState({ appliedCoupon: null });
};


// --- Initialization and Auth Sync ---
const initialize = async () => {
  try {
    const savedItems = await AsyncStorage.getItem('cart_items');
    const savedCoupon = await AsyncStorage.getItem('cart_coupon');
    if (savedItems) {
      const items = JSON.parse(savedItems);
      const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
      state = { ...state, items, total };
    }
    if (savedCoupon) {
        state = { ...state, appliedCoupon: JSON.parse(savedCoupon) };
    }
  } catch (e) {
    console.error("Failed to load cart from storage", e);
  }
  notifyListeners();
  syncWithBackend(); // Sync after loading from cache
};

// Only run initialization and subscriptions on the client side
if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  authManager.subscribe((session) => {
    console.log('Auth state changed, re-syncing cart...');
    syncWithBackend();
  });

  initialize();
}

// --- Custom Hook ---
import { useEffect, useState } from 'react';

export const useCart = () => {
  const [cartState, setCartState] = useState(state);

  useEffect(() => {
    const listener = (newState: CartState) => {
      setCartState(newState);
    };
    listeners.add(listener);
    // Initial sync of state for the component
    listener(state); 
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncWithBackend,
    applyCoupon,
    removeCoupon,
  };
}; 