import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, Store, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from '../components/ui/button';
import { SafeAreaView } from '../components/ui/safe-area-view';
import { Text } from '../components/ui/text';
import { CartItem, useCart } from './_layout';

interface StoreGroup {
  storeName: string;
  items: CartItem[];
  subtotal: number;
}

// Utility function to group items by store
const groupItemsByStore = (items: CartItem[]): Record<string, StoreGroup> => {
  return items.reduce((acc: Record<string, StoreGroup>, item: CartItem) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: [],
        subtotal: 0,
      };
    }
    acc[item.storeId].items.push(item);
    acc[item.storeId].subtotal += item.price * item.quantity;
    return acc;
  }, {});
};

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponValidating(true);
    setCouponError(null);
    try {
      const result = await applyCoupon(couponCode);
      if (!result.valid) {
        setCouponError(result.message || 'Invalid coupon code.');
      } else {
        setCouponCode('');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon.');
    } finally {
      setCouponValidating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Cart...</Text>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Your cart is empty</Text>
        <Button onPress={() => router.back()}>
          <Text>Continue Shopping</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const itemsByStore = groupItemsByStore(items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const storeCount = Object.keys(itemsByStore).length;
  const deliveryFee = 40 * storeCount;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.floor(subtotal + deliveryFee - couponDiscount);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearButton}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Store Groups */}
        {Object.entries(itemsByStore).map(([storeId, storeData]: [string, StoreGroup]) => (
          <View key={storeId} style={styles.storeCard}>
            <View style={styles.storeHeader}>
              <Store size={20} color="#6B7280" />
              <Text style={styles.storeName}>{storeData.storeName}</Text>
            </View>
            {storeData.items.map((item) => (
              <View key={item.itemId} style={styles.itemContainer}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price.toFixed(2)} per {item.unit}
                  </Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => updateQuantity(item.itemId, item.quantity - 1)}>
                      <Minus size={16} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.itemId, item.quantity + 1)}>
                      <Plus size={16} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemSubtotal}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.itemId)}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Delivery Fee ({storeCount} stores)</Text>
            <Text>₹{deliveryFee.toFixed(2)}</Text>
          </View>

          {/* Coupon Section */}
          <View style={styles.couponSection}>
            {appliedCoupon ? (
              <View style={styles.appliedCoupon}>
                <Text>
                  {appliedCoupon.code} ({appliedCoupon.discountPercentage}%)
                </Text>
                <TouchableOpacity onPress={removeCoupon}>
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <Button onPress={handleApplyCoupon} disabled={couponValidating}>
                  <Text>{couponValidating ? 'Applying...' : 'Apply Coupon'}</Text>
                </Button>
                {couponError && <Text style={styles.couponError}>{couponError}</Text>}
              </View>
            )}
          </View>
          
          {appliedCoupon && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountText}>Coupon Discount</Text>
              <Text style={styles.discountText}>-₹{couponDiscount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>₹{finalTotal.toFixed(2)}</Text>
          </View>
          
          <Button
            style={styles.checkoutButton}
            onPress={() =>
              router.push({
                pathname: '/(app)/billing',
                params: {
                  appliedCoupon: JSON.stringify(appliedCoupon),
                  subtotal: subtotal,
                  deliveryFee: deliveryFee,
                  totalDiscount: couponDiscount,
                },
              })
            }
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  clearButton: { color: '#EF4444' },
  scrollContainer: { padding: 16 },
  storeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  storeName: { marginLeft: 8, fontWeight: '500' },
  itemContainer: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  itemImage: { width: 64, height: 64, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: 'bold' },
  itemPrice: { color: '#6B7280', marginVertical: 4 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityText: { marginHorizontal: 12, fontSize: 16 },
  itemActions: { alignItems: 'flex-end' },
  itemSubtotal: { fontWeight: 'bold', marginBottom: 16 },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  couponSection: { marginVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12 },
  appliedCoupon: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#E0F2F1', borderRadius: 6 },
  couponInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  couponError: { color: '#EF4444', marginTop: 4 },
  discountText: { color: '#10B981' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#E5E7EB', paddingTop: 12, marginTop: 8 },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  checkoutButton: { marginTop: 16 },
  checkoutButtonText: { color: 'white', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
}); 