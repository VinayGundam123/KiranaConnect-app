import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { buyerAPI } from './api';

export interface Store {
  _id: string;
  name: string;
  storeAddress: string;
  storeImgUrl?: string;
  rating?: number;
  inventory?: Product[];
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image?: string;
  image_url?: string;
  storeName?: string;
  storeId?: string;
  description?: string;
}

interface DataContextType {
  stores: Store[];
  allProducts: Product[];
  loading: boolean;
  error: string | null;
  searchProducts: (query: string, category?: string) => Product[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stores and products in parallel
      const [storesResponse, productsResponse] = await Promise.all([
        buyerAPI.getStores({ limit: 100 }), // Get all stores
        buyerAPI.getProducts({ limit: 1000 }) // Get all products
      ]);

      if (storesResponse.data?.success) {
        setStores(storesResponse.data.stores || []);
      }

      if (productsResponse.data?.success) {
        const products = productsResponse.data.products || [];
        
        // Enhance products with store information if available
        const enhancedProducts = products.map((product: Product) => ({
          ...product,
          image: product.image_url || product.image,
        }));
        
        setAllProducts(enhancedProducts);
      }

    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string, category?: string): Product[] => {
    if (!query.trim() && !category) return [];

    return allProducts.filter(product => {
      const matchesQuery = !query.trim() || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
        (product.storeName && product.storeName.toLowerCase().includes(query.toLowerCase()));

      const matchesCategory = !category || 
        category === 'all' || 
        product.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  };

  const refreshData = async () => {
    await fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const value: DataContextType = {
    stores,
    allProducts,
    loading,
    error,
    searchProducts,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 