import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buyerAPI, sellerAPI } from './api';

// Simple cache to store API responses
const apiCache = new Map<string, { data: any; timestamp: number; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to generate cache key
const getCacheKey = (endpoint: string, params?: any) => {
  return `${endpoint}_${JSON.stringify(params || {})}`;
};

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry: { timestamp: number; expiry: number }) => {
  return Date.now() - cacheEntry.timestamp < cacheEntry.expiry;
};

// Generic data fetching hook with caching and proper dependencies
function useApiData<T>(
  apiCall: () => Promise<{ data: T }>, 
  cacheKey: string,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cacheEntry = apiCache.get(cacheKey);
    if (cacheEntry && isCacheValid(cacheEntry)) {
      setData(cacheEntry.data);
      setLoading(false);
      return;
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      // Cache the response
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        expiry: CACHE_DURATION
      });
      
      setData(response.data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, enabled]);

  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache for this key and refetch
    apiCache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  return { data, loading, error, refetch };
}

// Buyer hooks with proper memoization
export function useStores(params?: { limit?: number; sortBy?: string }, enabled: boolean = true) {
  const cacheKey = useMemo(() => getCacheKey('stores', params), [params?.limit, params?.sortBy]);
  const apiCall = useCallback(() => buyerAPI.getStores(params), [params?.limit, params?.sortBy]);
  
  return useApiData(apiCall, cacheKey, enabled);
}

export function useStore(storeId: string) {
  const cacheKey = useMemo(() => getCacheKey('store', { storeId }), [storeId]);
  const apiCall = useCallback(() => buyerAPI.getStore(storeId), [storeId]);
  
  return useApiData(apiCall, cacheKey, !!storeId);
}

export function useProducts(params?: { category?: string; limit?: number; sortBy?: string; search?: string }, enabled: boolean = true) {
  const cacheKey = useMemo(() => 
    getCacheKey('products', params), 
    [params?.category, params?.limit, params?.sortBy, params?.search]
  );
  const apiCall = useCallback(() => buyerAPI.getProducts(params), 
    [params?.category, params?.limit, params?.sortBy, params?.search]
  );
  
  return useApiData(apiCall, cacheKey, enabled);
}

export function useProduct(productId: string) {
  const cacheKey = useMemo(() => getCacheKey('product', { productId }), [productId]);
  const apiCall = useCallback(() => buyerAPI.getProduct(productId), [productId]);
  
  return useApiData(apiCall, cacheKey, !!productId);
}

export function useCart(buyerId: string) {
  const cacheKey = useMemo(() => getCacheKey('cart', { buyerId }), [buyerId]);
  const apiCall = useCallback(() => buyerAPI.getCart(buyerId), [buyerId]);
  
  return useApiData(apiCall, cacheKey, !!buyerId);
}

export function useOrders(buyerId: string) {
  const cacheKey = useMemo(() => getCacheKey('orders', { buyerId }), [buyerId]);
  const apiCall = useCallback(() => buyerAPI.getOrders(buyerId), [buyerId]);
  
  return useApiData(apiCall, cacheKey, !!buyerId);
}

export function useBuyerNotifications(buyerId: string, params?: { limit?: number }) {
  const cacheKey = useMemo(() => 
    getCacheKey('buyer_notifications', { buyerId, ...params }), 
    [buyerId, params?.limit]
  );
  const apiCall = useCallback(() => buyerAPI.getNotifications(buyerId, params), 
    [buyerId, params?.limit]
  );
  
  return useApiData(apiCall, cacheKey, !!buyerId);
}

// Seller hooks with proper memoization
export function useSellerOrders(sellerId: string, params?: { status?: string; limit?: number }) {
  const cacheKey = useMemo(() => 
    getCacheKey('seller_orders', { sellerId, ...params }), 
    [sellerId, params?.status, params?.limit]
  );
  const apiCall = useCallback(() => sellerAPI.getOrders(sellerId, params), 
    [sellerId, params?.status, params?.limit]
  );
  
  return useApiData(apiCall, cacheKey, !!sellerId);
}

export function useInventory(sellerId: string) {
  const cacheKey = useMemo(() => getCacheKey('inventory', { sellerId }), [sellerId]);
  const apiCall = useCallback(() => sellerAPI.getInventory(sellerId), [sellerId]);
  
  return useApiData(apiCall, cacheKey, !!sellerId);
}

export function useSellerNotifications(sellerId: string) {
  const cacheKey = useMemo(() => getCacheKey('seller_notifications', { sellerId }), [sellerId]);
  const apiCall = useCallback(() => sellerAPI.getNotifications(sellerId), [sellerId]);
  
  return useApiData(apiCall, cacheKey, !!sellerId);
}

// Cache management utilities
export const clearAllCache = () => {
  apiCache.clear();
};

export const clearCacheByPattern = (pattern: string) => {
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
}; 