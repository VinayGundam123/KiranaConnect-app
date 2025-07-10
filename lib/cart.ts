import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeId: string;
  storeName: string;
  category: string;
  description: string;
  unit: string;
  maxQuantity: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemsByStore: () => Record<string, CartItem[]>;
}

const CART_STORAGE_KEY = 'kirana-cart';

// Simple cart state management without zustand
class CartManager {
  private items: CartItem[] = [];
  private isOpen: boolean = false;
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    // Don't initialize during SSR
    if (Platform.OS !== 'web' || typeof window !== 'undefined') {
      this.initialize();
    }
  }

  // Initialize the cart manager
  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    await this.loadCartFromStorage();
  }

  // Subscribe to cart changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Load cart from storage
  private async loadCartFromStorage() {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return; // Skip during SSR
      }
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        this.items = JSON.parse(savedCart);
        this.notify();
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  }

  // Save cart to storage
  private async saveCartToStorage() {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return; // Skip during SSR
      }
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  // Get current state
  async getState(): Promise<CartStore> {
    // Ensure initialization before returning state
    if (!this.initialized) {
      await this.initialize();
    }
    
    return {
      items: [...this.items],
      isOpen: this.isOpen,
      addItem: this.addItem.bind(this),
      removeItem: this.removeItem.bind(this),
      updateQuantity: this.updateQuantity.bind(this),
      clearCart: this.clearCart.bind(this),
      toggleCart: this.toggleCart.bind(this),
      getTotalPrice: this.getTotalPrice.bind(this),
      getTotalItems: this.getTotalItems.bind(this),
      getItemsByStore: this.getItemsByStore.bind(this),
    };
  }

  async addItem(newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) {
    await this.initialize();
    
    const existingItem = this.items.find(item => item.id === newItem.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + (newItem.quantity || 1);
      const maxQuantity = newItem.maxQuantity || 10;
      existingItem.quantity = Math.min(newQuantity, maxQuantity);
    } else {
      const cartItem: CartItem = {
        ...newItem,
        quantity: newItem.quantity || 1,
      };
      this.items.push(cartItem);
    }
    
    await this.saveCartToStorage();
    this.notify();
  }

  async removeItem(id: string) {
    await this.initialize();
    this.items = this.items.filter(item => item.id !== id);
    await this.saveCartToStorage();
    this.notify();
  }

  async updateQuantity(id: string, quantity: number) {
    await this.initialize();
    
    if (quantity <= 0) {
      await this.removeItem(id);
      return;
    }
    
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
      await this.saveCartToStorage();
      this.notify();
    }
  }

  async clearCart() {
    await this.initialize();
    this.items = [];
    await this.saveCartToStorage();
    this.notify();
  }

  async toggleCart() {
    await this.initialize();
    this.isOpen = !this.isOpen;
    this.notify();
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getItemsByStore(): Record<string, CartItem[]> {
    return this.items.reduce((acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = [];
      }
      acc[item.storeId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  }
}

// Create a singleton cart manager
export const cartManager = new CartManager();

// Export a function to get the current cart state
export const useCart = async () => await cartManager.getState(); 