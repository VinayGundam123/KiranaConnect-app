import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SESSION_KEY = 'user_session';

export interface UserSession {
  id: string;
  role: 'buyer' | 'seller';
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

// Web-compatible storage wrapper
class StorageManager {
  static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  }

  static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  }

  static async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  }
}

class AuthManager {
  private session: UserSession | null = null;
  private listeners: Set<(session: UserSession | null) => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    // Don't initialize during SSR
    if (Platform.OS !== 'web' || typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    await this.loadSession();
  }

  subscribe(listener: (session: UserSession | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.session));
  }

  async loadSession(): Promise<UserSession | null> {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return null; // Skip during SSR
    }
    
    try {
      // For web, check for buyerId/sellerId in localStorage (compatibility with existing web app)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const buyerId = localStorage.getItem('buyerId');
        const sellerId = localStorage.getItem('sellerId');
        
        if (buyerId) {
          // Create session from buyerId
          this.session = {
            id: buyerId,
            role: 'buyer',
            token: buyerId, // Using buyerId as token for compatibility
            user: {
              _id: buyerId,
              name: '', // Will be filled from backend if needed
              email: '',
            }
          };
          this.notify();
          return this.session;
        }
        
        if (sellerId) {
          // Create session from sellerId
          this.session = {
            id: sellerId,
            role: 'seller',
            token: sellerId, // Using sellerId as token for compatibility
            user: {
              _id: sellerId,
              name: '',
              email: '',
            }
          };
          this.notify();
          return this.session;
        }
      } else {
        // For React Native, use the complex session object
        const sessionData = await StorageManager.getItem(SESSION_KEY);
        if (sessionData) {
          this.session = JSON.parse(sessionData);
          this.notify();
          return this.session;
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
    return null;
  }

  async saveSession(role: 'buyer' | 'seller', userData: any): Promise<void> {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return; // Skip during SSR
    }

    try {
      console.log('Saving session for role:', role, 'with data:', userData); // Debug log
      
      // Handle different response structures
      const userId = userData._id || userData.id || userData.user?._id || userData.user?.id || userData;
      const token = userData.token || userData.accessToken || userData.jwt || userData;
      const userInfo = userData.user || userData;
      
      if (!userId) {
        console.error('No user ID found in response:', userData);
        throw new Error('User ID not found in response');
      }
      
      const session: UserSession = {
        id: userId,
        role,
        token: token,
        user: {
          _id: userId,
          name: userInfo.name || userInfo.username || '',
          email: userInfo.email || '',
          phone: userInfo.phone,
        },
      };
      
      console.log('Created session object:', session); // Debug log
      
      this.session = session;
      
      // For web, store in localStorage for compatibility with existing web app
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (role === 'buyer') {
          localStorage.setItem('buyerId', userId);
          localStorage.removeItem('sellerId'); // Clear other role
        } else {
          localStorage.setItem('sellerId', userId);
          localStorage.removeItem('buyerId'); // Clear other role
        }
        console.log(`${role}Id saved to localStorage:`, userId);
      } else {
        // For React Native, save full session object
        await StorageManager.setItem(SESSION_KEY, JSON.stringify(session));
      }
      
      this.notify();
      console.log('Session saved successfully'); // Debug log
    } catch (error) {
      console.error('Error saving session:', error);
      throw error; // Re-throw so caller knows it failed
    }
  }

  async clearSession(): Promise<void> {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return; // Skip during SSR
    }

    try {
      this.session = null;
      
      // For web, clear localStorage
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.removeItem('buyerId');
        localStorage.removeItem('sellerId');
      } else {
        // For React Native, clear AsyncStorage
        await StorageManager.removeItem(SESSION_KEY);
      }
      
      this.notify();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  async getCurrentSession(): Promise<UserSession | null> {
    await this.initialize();
    return this.session;
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session?.token;
  }

  async getCurrentUserId(): Promise<string | null> {
    const session = await this.getCurrentSession();
    return session?.user._id || session?.id || null;
  }

  async getCurrentUserRole(): Promise<'buyer' | 'seller' | null> {
    const session = await this.getCurrentSession();
    return session?.role || null;
  }

  async getCurrentUser(): Promise<UserSession['user'] | null> {
    const session = await this.getCurrentSession();
    return session?.user || null;
  }
}

// Create singleton auth manager
export const authManager = new AuthManager();

// Export convenience functions
export const saveSession = (role: 'buyer' | 'seller', userData: any) => 
  authManager.saveSession(role, userData);

export const clearSession = () => authManager.clearSession();

export const getCurrentSession = () => authManager.getCurrentSession();

export const isAuthenticated = () => authManager.isAuthenticated();

export const getCurrentUserId = () => authManager.getCurrentUserId();

export const getCurrentUserRole = () => authManager.getCurrentUserRole();

export const getCurrentUser = () => authManager.getCurrentUser(); 