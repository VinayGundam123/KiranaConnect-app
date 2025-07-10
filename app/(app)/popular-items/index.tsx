import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from '../../../components/ui/safe-area-view';
import { Text } from '../../../components/ui/text';
import { useProducts } from '../../../lib/hooks';
import { theme } from '../../../lib/theme';
import { useWishlist } from '../../_layout';
import { ProductCard } from '../../components/ui/product-card';
import { useCart } from '../_layout';

const PopularItemsScreen = () => {
  const router = useRouter();
  const { data, loading, error } = useProducts({ sortBy: 'popularity' });
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product, 1); // Pass product and quantity
      showToast(`${product.name} added to cart`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showToast(`Failed to add ${product.name} to cart`);
    }
  };

  const handleWishlistToggle = (product: any) => {
    // This function needs the full logic from the index page
    // For now, just showing a toast
    showToast(`${product.name} updated in wishlist`);
  };

  const products = data?.products || [];

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.itemWrapper}>
      <ProductCard
        product={item}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>Loading popular items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text variant="h2">Popular Items</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtitle}>Discover trending products from top stores</Text>
      
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
      
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors?.gray?.[50] || '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing?.lg || 16,
    backgroundColor: theme.colors?.white || '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors?.gray?.[200] || '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors?.gray?.[600] || '#4B5563',
    paddingHorizontal: theme.spacing?.lg || 16,
    paddingVertical: theme.spacing?.md || 12,
    backgroundColor: theme.colors?.white || '#FFFFFF',
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
  itemWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: 'white',
  },
}); 