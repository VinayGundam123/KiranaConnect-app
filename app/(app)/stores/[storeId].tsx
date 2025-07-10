import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Clock,
  MapPin,
  Menu,
  Star
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useStore } from '../../../lib/hooks';
import { useWishlist } from '../../_layout';
import { Input } from '../../components/ui/input';
import { ProductCard } from '../../components/ui/product-card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { useCart } from '../_layout';

export default function StoreDetailScreen() {
  const router = useLocalSearchParams<{ storeId: string }>();
  const { storeId } = router;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: storeData, loading, error } = useStore(storeId as string);
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000); // Hide after 2 seconds
  };

  const storeDetails = storeData?.store;
  const inventory = storeDetails?.inventory || [];

  const categories = useMemo(() => {
    if (!inventory.length) return [];
    const allCategories = inventory.map((item: any) => item.category);
    return Array.from(new Set(allCategories as string[]));
  }, [inventory]);

  const filteredItems = useMemo(() => {
    if (!inventory.length) return [];
    return inventory.filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory]);

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

  const renderHeader = useCallback(
    () => (
      <>
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
          <Input
            placeholder="Search items in this store..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
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
      </>
    ),
    [
      storeDetails,
      searchQuery,
      categories,
      selectedCategory,
      setSelectedCategory,
      setSearchQuery,
    ]
  );

  const renderInventoryItem = ({ item }: { item: any }) => {
    const productForCard = {
      ...item,
      _id: item._id,
      image: item.image_url,
      storeName: storeDetails?.name,
      storeId: storeDetails?._id,
    };

    return (
      <View style={styles.itemContainer}>
        <ProductCard
          product={productForCard}
          onAddToCart={() => handleAddToCart(item)}
          onWishlistToggle={() => handleWishlistToggle(item)}
        />
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.newHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>KiranaConnect</Text>
        </View>
        <TouchableOpacity onPress={() => console.log('Menu pressed')}>
          <Menu size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredItems}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader}
        renderItem={renderInventoryItem}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.listRow}
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    height: 256,
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
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
  },
  newHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  searchInput: {
    marginBottom: 16,
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
  listContent: {
    paddingBottom: 16,
  },
  listRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  itemContainer: {
    flex: 0.5,
    paddingHorizontal: 4,
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