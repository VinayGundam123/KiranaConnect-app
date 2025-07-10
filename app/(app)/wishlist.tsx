import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Store,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { useWishlist, WishlistItem } from '../_layout';

// Mock add to cart function for now
const handleAddToCart = (item: WishlistItem) => {
  Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
};

export default function WishlistScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    items: wishlistItems,
    removeFromWishlist,
    loading,
  } = useWishlist();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const filteredItems = wishlistItems.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromWishlist = (itemId: string) => {
    removeFromWishlist(itemId);
    showToast('Item removed from your wishlist.');
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => router.push(`/products/${item._id}` as any)}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/300' }}
          style={styles.itemImage}
        />
      </TouchableOpacity>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemStore}>{item.storeName}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
        <View style={styles.itemActions}>
          <Button size="sm" onPress={() => handleAddToCart(item)}>
            <ShoppingCart size={16} color="white" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => handleRemoveFromWishlist(item.itemId)}
          >
            <Trash2 size={16} color="red" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => router.push(`/stores/${item.storeId}` as any)}
          >
            <Store size={16} color="gray" />
          </Button>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search in wishlist..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderWishlistItem}
          keyExtractor={item => item.itemId}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Heart size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubText}>
            Tap the heart on any product to save it here.
          </Text>
          <Button onPress={() => router.push('/' as any)}>
            Browse Products
          </Button>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchContainer: { padding: 16 },
  listContainer: { paddingHorizontal: 16 },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: { width: 100, height: 100, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemStore: { fontSize: 14, color: '#6B7280' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  itemActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600' },
  emptySubText: { marginTop: 8, color: '#6B7280', textAlign: 'center' },
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