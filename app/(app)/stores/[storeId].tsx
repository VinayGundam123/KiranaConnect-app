import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, MapPin, Star, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../../lib/cart';
import { useHeader } from '../../../lib/header-context';
import { useStore } from '../../../lib/hooks';
import { useWishlist } from '../../_layout';
import { Input } from '../../components/ui/input';
import { ProductCard } from '../../components/ui/product-card';
import { Text } from '../../components/ui/text';

export default function StoreDetailScreen() {
  const params = useLocalSearchParams<{ storeId: string }>();
  const { storeId } = params;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: storeData, loading, error } = useStore(storeId as string);
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { setTitle } = useHeader();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000); // Hide after 2 seconds
  };

  const storeDetails = storeData?.store;

  useEffect(() => {
    if (storeDetails?.name) {
      setTitle(`${storeDetails.name} Store`);
    }

    // Reset title on component unmount
    return () => {
      setTitle(null);
    };
  }, [storeDetails?.name, setTitle]);

  const inventory = storeDetails?.inventory || [];

  const categories = useMemo(() => {
    if (!inventory.length) return [];
    const allCategories = inventory.map((item: any) => item.category);
    return Array.from(new Set(allCategories as string[]));
  }, [inventory]);

  const filteredItems = useMemo(() => {
    if (!inventory.length) return [];
    return inventory.filter((item: any) => {
      // Enhanced search logic - search across multiple fields
      const matchesSearch = debouncedSearchQuery === '' || 
        item.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, debouncedSearchQuery, selectedCategory]);

  // Enhanced empty state messaging
  const getEmptyMessage = () => {
    if (!inventory.length) {
      return {
        title: 'No items available',
        subtitle: 'This store currently has no inventory.'
      };
    }
    
    if (debouncedSearchQuery && selectedCategory) {
      return {
        title: 'No items found',
        subtitle: `No items found for "${debouncedSearchQuery}" in ${selectedCategory}`
      };
    } else if (debouncedSearchQuery) {
      return {
        title: 'No items found',
        subtitle: `No items found for "${debouncedSearchQuery}"`
      };
    } else if (selectedCategory) {
      return {
        title: 'No items found',
        subtitle: `No items found in ${selectedCategory}`
      };
    }
    
    return {
      title: 'No items found',
      subtitle: 'Try adjusting your search or filters.'
    };
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  const handleAddToCart = async (item: any) => {
    try {
      await addToCart({
        ...item,
        storeId: storeDetails?._id,
        storeName: storeDetails?.name,
      }, 1); // Pass item and quantity
      showToast(`${item.name} added to cart`);
    } catch (err) {
      console.error('Failed to add item to cart', err);
      showToast('Failed to add item to cart.');
    }
  };

  const handleWishlistToggle = async (item: any) => {
    try {
      if (isInWishlist(item._id)) {
        await removeFromWishlist(item._id);
        showToast(`${item.name} removed from wishlist`);
      } else {
        await addToWishlist({
          ...item,
          itemId: item._id,
          storeId: storeDetails?._id,
          storeName: storeDetails?.name,
        });
        showToast(`${item.name} added to wishlist`);
      }
    } catch (err) {
      console.error('Failed to update wishlist', err);
      showToast('Failed to update wishlist.');
    }
  };

  if (loading && !storeDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading store...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error loading store. Please try again.</Text>
      </View>
    );
  }

  const emptyMessage = getEmptyMessage();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Store Header */}
        <ImageBackground
          source={{
            uri:
              storeDetails?.storeImgUrl ||
              'https://via.placeholder.com/800x256?text=Store+Image',
          }}
          style={styles.headerImage}
        >
          <View style={styles.headerOverlay}>
            <View style={{ flex: 1 }} />
            <View style={styles.headerTextContainer}>
              <Text variant="h3" style={styles.storeName}>
                {storeDetails?.name}
              </Text>
              <View style={styles.storeInfoRow}>
                <Star size={14} color="#FFC107" />
                <Text style={styles.storeInfoText}>
                  {storeDetails?.rating || 'N/A'}
                </Text>
                <MapPin size={14} color="#FFFFFF" style={{ marginLeft: 12 }} />
                <Text style={styles.storeInfoText} numberOfLines={1}>
                  {storeDetails?.storeAddress || 'Address not available'}
                </Text>
                <Clock size={14} color="#FFFFFF" style={{ marginLeft: 12 }} />
                <Text style={styles.storeInfoText}>30 mins</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Search and Filters */}
        <View style={styles.filterContainer}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Search items, categories, descriptions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.categoryContainer}>
            {['All Categories', ...categories].map(item => {
              const isSelected =
                (selectedCategory === null && item === 'All Categories') ||
                selectedCategory === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() =>
                    setSelectedCategory(item === 'All Categories' ? null : item)
                  }
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      isSelected && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <View style={styles.productsContainer}>
            {filteredItems.map((item: any, index: number) => {
              const productForCard = {
                ...item,
                _id: item._id,
                image: item.image_url,
                storeName: storeDetails?.name,
                storeId: storeDetails?._id,
              };

              return (
                <View key={item._id} style={styles.itemContainer}>
                  <ProductCard
                    product={productForCard}
                    onAddToCart={() => handleAddToCart(item)}
                    onWishlistToggle={() => handleWishlistToggle(item)}
                    onPress={() => router.push(`/(app)/products/${item._id}`)}
                    isInWishlist={isInWishlist(item._id)}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
            <Text style={styles.emptySubtitle}>
              {emptyMessage.subtitle}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    height: 256,
    justifyContent: 'flex-end',
    width: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    padding: 16,
  },
  storeName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  storeInfoText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    flexShrink: 1,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    paddingRight: 45, // Make room for clear button
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryButtonText: {
    color: '#374151',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  productsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptySubtitle: {
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
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
    fontWeight: 'bold',
  },
}); 