import { router } from 'expo-router';
import { Minus, Plus, Store, Trash2, X } from 'lucide-react-native';
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
import { getCurrentSession } from '../../lib/auth';
import { CartItem, useCart } from '../../lib/cart';
import { Button } from '../components/ui/button';
import { SafeAreaView } from '../components/ui/safe-area-view';
import { Text } from '../components/ui/text';

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
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponValidated, setCouponValidated] = useState(false);
  const [validatedCouponData, setValidatedCouponData] = useState<any>(null);

  // Coupon validation function (just checks if valid)
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponValidating(true);
      setCouponError(null);
      setCouponValidated(false);
      
      const response = await fetch(`https://vigorously-more-impala.ngrok-free.app/buyer/cart/${await getCurrentBuyerId()}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          couponCode: couponCode.trim().toUpperCase()
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setCouponValidated(true);
        setValidatedCouponData(data.coupon);
        setCouponError(null);
        // Show success message but don't apply yet
        console.log(`Valid coupon! ${data.coupon.discountPercentage}% off - Save ₹${data.coupon.discountAmount}`);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      const errorMessage = 'Failed to validate coupon';
      setCouponError(errorMessage);
    } finally {
      setCouponValidating(false);
    }
  };

  // Apply coupon function (applies the validated coupon)
  const handleApplyCoupon = async () => {
    if (!couponValidated || !validatedCouponData) {
      setCouponError('Please validate the coupon first');
      return;
    }

    try {
      setCouponApplying(true);
      setCouponError(null);
      
      const result = await applyCoupon(couponCode);
      if (result.valid) {
        setCouponCode('');
        setCouponValidated(false);
        setValidatedCouponData(null);
      } else {
        setCouponError(result.message || 'Failed to apply coupon');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Failed to apply coupon.');
    } finally {
      setCouponApplying(false);
    }
  };

  // Get current buyer ID from auth session
  const getCurrentBuyerId = async () => {
    try {
      const session = await getCurrentSession();
      return session?.user?._id;
    } catch (error) {
      console.error('Failed to get buyer ID:', error);
      return null;
    }
  };

  const handleClearCart = () => {
    clearCart();
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
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
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
      {/* Clear Cart Button at top */}
      <View style={styles.topActions}>
        <Button variant="outline" onPress={handleClearCart} style={styles.clearCartBtn}>
          <Text style={styles.clearCartText}>Clear Cart</Text>
        </Button>
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
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.itemId, item.quantity - 1)}
                      style={styles.quantityBtn}
                    >
                      <Minus size={16} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.itemId, item.quantity + 1)}
                      style={styles.quantityBtn}
                    >
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

        {/* Coupon Section */}
        <View style={styles.couponCard}>
          <Text style={styles.couponTitle}>Have a coupon?</Text>
          {appliedCoupon ? (
            <View style={styles.appliedCoupon}>
              <View style={styles.appliedCouponInfo}>
                <Text style={styles.appliedCouponText}>
                  {appliedCoupon.code}
                </Text>
                <Text style={styles.appliedCouponDiscount}>
                  {appliedCoupon.discountPercentage}% off
                </Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                <X size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputSection}>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={(text) => {
                    setCouponCode(text.toUpperCase());
                    setCouponValidated(false);
                    setValidatedCouponData(null);
                    setCouponError(null);
                  }}
                  autoCapitalize="characters"
                  editable={!couponValidating && !couponApplying}
                />
                <Button 
                  onPress={validateCoupon} 
                  disabled={couponValidating || couponApplying || !couponCode.trim()}
                  style={styles.checkCouponBtn}
                >
                  <Text style={styles.checkCouponText}>
                    {couponValidating ? 'Checking...' : 'Check'}
                  </Text>
                </Button>
              </View>
              
              {couponValidated && validatedCouponData && (
                <View style={styles.validatedCouponInfo}>
                  <Text style={styles.validatedText}>
                    ✓ Valid coupon! {validatedCouponData.discountPercentage}% off - Save ₹{validatedCouponData.discountAmount}
                  </Text>
                </View>
              )}
              
              <Button 
                onPress={handleApplyCoupon} 
                disabled={!couponValidated || couponApplying || !couponCode.trim()}
                style={[styles.applyCouponBtn, (!couponValidated || !validatedCouponData) && styles.applyCouponBtnDisabled]}
              >
                <Text style={[styles.applyCouponText, (!couponValidated || !validatedCouponData) && styles.applyCouponTextDisabled]}>
                  {couponApplying ? 'Applying...' : 'Apply Coupon'}
                </Text>
              </Button>
              
              {couponError && <Text style={styles.couponError}>{couponError}</Text>}
            </View>
          )}
        </View>

        {/* Spacing for footer */}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Sticky Footer with Order Summary and Checkout */}
      <View style={styles.footer}>
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery ({storeCount} stores):</Text>
            <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          {appliedCoupon && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Coupon Discount:</Text>
              <Text style={styles.discountValue}>-₹{couponDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        <Button
          style={styles.checkoutButton}
          onPress={() =>
            router.push({
              pathname: '/(app)/billing',
              params: {
                appliedCoupon: JSON.stringify(appliedCoupon),
                subtotal: subtotal.toString(),
                deliveryFee: deliveryFee.toString(),
                totalDiscount: couponDiscount.toString(),
              },
            })
          }
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  topActions: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  clearCartBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearCartText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#374151',
  },
  scrollContainer: { 
    padding: 16,
    paddingBottom: 120, // Space for footer
  },
  storeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  storeName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 8,
    color: '#374151',
  },
  itemContainer: { 
    flexDirection: 'row', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  itemImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 8 
  },
  itemDetails: { 
    flex: 1, 
    marginLeft: 12 
  },
  itemName: { 
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  itemPrice: { 
    color: '#6B7280', 
    fontSize: 14,
    marginBottom: 8,
  },
  quantityContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityBtn: {
    padding: 8,
  },
  quantityText: { 
    marginHorizontal: 16, 
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: { 
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemSubtotal: { 
    fontWeight: 'bold', 
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  couponCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  couponInputSection: {
    gap: 12,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  checkCouponBtn: {
    paddingHorizontal: 16,
    backgroundColor: '#6B7280',
  },
  checkCouponText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  validatedCouponInfo: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  validatedText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
  },
  applyCouponBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyCouponBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  applyCouponText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  applyCouponTextDisabled: {
    color: '#9CA3AF',
  },
  appliedCoupon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  appliedCouponInfo: {
    flex: 1,
  },
  appliedCouponText: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appliedCouponDiscount: {
    color: '#059669',
    fontSize: 12,
    marginTop: 2,
  },
  removeCouponBtn: {
    padding: 4,
  },
  couponError: { 
    color: '#EF4444', 
    marginTop: 8,
    fontSize: 14,
  },
  footerSpacer: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  orderSummary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 14,
    color: '#059669',
  },
  discountValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  checkoutButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 