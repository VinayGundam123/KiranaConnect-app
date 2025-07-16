import { useRouter } from 'expo-router';
import {
  Heart,
  ShoppingCart,
  Store,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useCart } from '../../lib/cart';
import { useWishlist, WishlistItem } from '../_layout';

// Custom Toast Component
const Toast = ({ visible, message, type, onHide }: {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
}) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <View style={[
      styles.toastContainer,
      type === 'success' ? styles.successToast : styles.errorToast
    ]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

export default function WishlistScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const {
    items: wishlistItems,
    removeFromWishlist,
    loading,
  } = useWishlist();
  const { addToCart } = useCart();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addToCart(item, 1);
      await removeFromWishlist(item.itemId);
      showToast(`${item.name} moved to cart.`, 'success');
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      showToast('Failed to move item. Please try again.', 'error');
    }
  };

  const filteredItems = wishlistItems.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromWishlist = async (itemId: string, name: string) => {
    try {
      await removeFromWishlist(itemId);
      showToast(`${name} removed from wishlist.`, 'success');
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      showToast('Failed to remove item. Please try again.', 'error');
    }
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => router.push(`/(app)/products/${item.itemId}`)}
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
            onPress={() => handleRemoveFromWishlist(item.itemId, item.name)}
          >
            <Trash2 size={16} color="red" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => router.push(`/(app)/stores/${item.storeId}`)}
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
          <Button onPress={() => router.push('/')}>
            Browse Products
          </Button>
        </View>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchContainer: { padding: 16 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  successToast: {
    backgroundColor: '#10B981',
  },
  errorToast: {
    backgroundColor: '#EF4444',
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 