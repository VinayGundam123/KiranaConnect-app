import axios from 'axios';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getCurrentSession } from './auth';

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
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const syncWithBackend = useCallback(async () => {
    setLoading(true);
    const session = await getCurrentSession();
    if (!session?.user?._id) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        ${API_BASE_URL}/buyer/cart/,
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

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const addToCart = useCallback(
    async (item: Omit<CartItem, 'quantity' | 'addedAt'>) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      const payload = { ...item, quantity: 1 };
      try {
        await axios.post(
          ${API_BASE_URL}/buyer/cart/,
          payload,
          { headers: NGROK_HEADER }
        );
        await syncWithBackend();
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        throw error;
      }
    },
    [syncWithBackend]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      try {
        await axios.delete(
          ${API_BASE_URL}/buyer/cart//remove,
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
          ${API_BASE_URL}/buyer/cart//quantity,
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
        ${API_BASE_URL}/buyer/cart//clear,
        { headers: NGROK_HEADER }
      );
      await syncWithBackend();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }, [syncWithBackend]);

  const applyCoupon = useCallback(
    async (couponCode: string) => {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

      try {
        const { data } = await axios.post(
          ${API_BASE_URL}/buyer/cart//coupons/validate,
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
    },
    []
  );

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
        syncWithBackend,
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