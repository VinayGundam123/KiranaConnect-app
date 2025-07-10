import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  storeId: string;
  storeName: string;
  category: string;
  description: string;
  unit: string;
  inStock: boolean;
  rating: number;
  addedAt: string;
}

export interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  getItemsByStore: () => Record<string, WishlistItem[]>;
  getItemsByCategory: () => Record<string, WishlistItem[]>;
}

const WISHLIST_STORAGE_KEY = 'kirana-wishlist';

// Simple wishlist state management without zustand
class WishlistManager {
  private items: WishlistItem[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    // Don't initialize during SSR
    if (Platform.OS !== 'web' || typeof window !== 'undefined') {
      this.initialize();
    }
  }

  // Initialize the wishlist manager
  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    await this.loadWishlistFromStorage();
  }

  // Subscribe to wishlist changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Load wishlist from storage
  private async loadWishlistFromStorage() {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return; // Skip during SSR
      }
      const savedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        this.items = JSON.parse(savedWishlist);
        this.notify();
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    }
  }

  // Save wishlist to storage
  private async saveWishlistToStorage() {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return; // Skip during SSR
      }
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  }

  // Get current state
  async getState(): Promise<WishlistStore> {
    // Ensure initialization before returning state
    if (!this.initialized) {
      await this.initialize();
    }
    
    return {
      items: [...this.items],
      addItem: this.addItem.bind(this),
      removeItem: this.removeItem.bind(this),
      isInWishlist: this.isInWishlist.bind(this),
      clearWishlist: this.clearWishlist.bind(this),
      getItemsByStore: this.getItemsByStore.bind(this),
      getItemsByCategory: this.getItemsByCategory.bind(this),
    };
  }

  async addItem(newItem: WishlistItem) {
    await this.initialize();
    
    if (!this.items.find(item => item.id === newItem.id)) {
      const itemWithTimestamp = { ...newItem, addedAt: new Date().toISOString() };
      this.items.push(itemWithTimestamp);
      await this.saveWishlistToStorage();
      this.notify();
    }
  }

  async removeItem(id: string) {
    await this.initialize();
    this.items = this.items.filter(item => item.id !== id);
    await this.saveWishlistToStorage();
    this.notify();
  }

  async isInWishlist(id: string): Promise<boolean> {
    await this.initialize();
    return this.items.some(item => item.id === id);
  }

  async clearWishlist() {
    await this.initialize();
    this.items = [];
    await this.saveWishlistToStorage();
    this.notify();
  }

  getItemsByStore(): Record<string, WishlistItem[]> {
    return this.items.reduce((acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = [];
      }
      acc[item.storeId].push(item);
      return acc;
    }, {} as Record<string, WishlistItem[]>);
  }

  getItemsByCategory(): Record<string, WishlistItem[]> {
    return this.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, WishlistItem[]>);
  }
}

// Create a singleton wishlist manager
export const wishlistManager = new WishlistManager();

// Export a function to get the current wishlist state
export const useWishlist = async () => await wishlistManager.getState(); 