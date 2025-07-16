import { useLocalSearchParams, useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { useCart } from '../../../lib/cart';
import { useHeader } from '../../../lib/header-context';
import { theme } from '../../../lib/theme';
import { useWishlist } from '../../_layout';
import { Button } from '../../components/ui/button';
import { ProductCard } from '../../components/ui/product-card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';

interface Product {
  _id: string;
  name: string;
  price: number;
  image_url: string;
  storeName: string;
  storeId: string;
  unit: string;
  category: string;
}

export default function CategoryItemsScreen() {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { setTitle } = useHeader();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : 'Category';

  useEffect(() => {
    // Set the header title to the category name
    setTitle(decodedCategoryName);

    // Reset title on component unmount
    return () => {
      setTitle(null);
    };
  }, [decodedCategoryName, setTitle]);

  useEffect(() => {
    if (categoryName) {
      fetchProductsByCategory(categoryName);
    }
  }, [categoryName]);

  const fetchProductsByCategory = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Fetching products for category: ${category}`);
      const response = await fetch(
        `https://vigorously-more-impala.ngrok-free.app/buyer/products?category=${encodeURIComponent(category)}&limit=50`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts([]);
        console.warn(`No products found for category: ${category}`);
      }
    } catch (err: any) {
      console.error('❌ Error fetching category products:', err);
      setError('Failed to load products. Please try again later.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch products for this category.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (product.price <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'This item cannot be added to the cart.',
      });
      return;
    }
    try {
      await addToCart(product, 1);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `${product.name} added to cart`,
      });
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart',
      });
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${product.name} removed from wishlist`,
        });
      } else {
        await addToWishlist({
          itemId: product._id,
          name: product.name,
          price: product.price,
          image: product.image_url,
          unit: product.unit,
          storeName: product.storeName,
          storeId: product.storeId,
          category: product.category,
        });
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${product.name} added to wishlist`,
        });
      }
    } catch (err: any) {
      console.error('Failed to update wishlist:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to update wishlist',
      });
    }
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        product={{ ...product, image: product.image_url }}
        onAddToCart={() => handleAddToCart(product)}
        onWishlistToggle={() => handleWishlistToggle(product)}
        onPress={() => router.push(`/(app)/products/${product._id}`)}
        isInWishlist={isInWishlist(product._id)}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading {decodedCategoryName}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Package size={48} color={theme.colors.gray[400]} />
          <Text style={styles.errorTitle}>Failed to Load Products</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            onPress={() => fetchProductsByCategory(categoryName!)}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={48} color={theme.colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>
            There are currently no products available in the "{decodedCategoryName}" category.
          </Text>
          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.backToDashboardButton}
          >
            Back to Dashboard
          </Button>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.pageTitle}>{decodedCategoryName}</Text>
          <Text style={styles.pageSubtitle}>
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </Text>
          
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  pageSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.red[50],
    margin: theme.spacing.md,
    borderRadius: 12,
  },
  errorTitle: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.red[600],
    textAlign: 'center',
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.red[600],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray[100],
    margin: theme.spacing.md,
    borderRadius: 12,
  },
  emptyTitle: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.gray[900],
    textAlign: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  backToDashboardButton: {
    marginTop: theme.spacing.md,
  },
  listContainer: {
    paddingBottom: theme.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
}); 