import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, MapPin, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getCurrentSession } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { SafeAreaView } from '../components/ui/safe-area-view';

// Custom Toast Component
const Toast = ({ visible, message, type, onHide }: {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[
      styles.toastContainer,
      { opacity: fadeAnim },
      type === 'success' ? styles.successToast : styles.errorToast
    ]}>
      <Text style={styles.toastText}>
        {type === 'success' ? '✅ ' : '❌ '}{message}
      </Text>
    </Animated.View>
  );
};

interface BillingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

const API_BASE_URL = 'https://vigorously-more-impala.ngrok-free.app';

export default function BillingScreen() {
  const router = useRouter();
  const { clearCart, items: cartItems } = useCart();
  const params = useLocalSearchParams();

  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const appliedCoupon = params.appliedCoupon ? JSON.parse(params.appliedCoupon as string) : null;
  const subtotal = parseFloat(params.subtotal as string);
  const deliveryFee = parseFloat(params.deliveryFee as string);
  const totalDiscount = parseFloat(params.totalDiscount as string);
  const finalTotal = Math.floor(subtotal + deliveryFee - totalDiscount);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  const handleInputChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    for (const [key, value] of Object.entries(billingAddress)) {
      if (key !== 'landmark' && !value.trim()) {
        showToast(`Please fill in your ${key}`, 'error');
        return false;
      }
    }
    
    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(billingAddress.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return false;
    }

    // Validate pincode
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(billingAddress.pincode)) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setPlacingOrder(true);
    try {
      const session = await getCurrentSession();
      if (!session?.user?._id) {
        showToast('Please log in to place order', 'error');
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          storeId: item.storeId,
          storeName: item.storeName,
        })),
        billingAddress,
        paymentMethod: 'pay_on_delivery',
        appliedCoupon: appliedCoupon,
        orderSummary: {
          subtotal,
          deliveryFee,
          couponDiscount: appliedCoupon ? appliedCoupon.discountAmount : 0,
          totalDiscount,
          finalTotal,
        },
      };

      const orderResponse = await axios.post(
        `${API_BASE_URL}/buyer/orders/${session.user._id}`,
        orderData
      );

      if (orderResponse.data.success) {
        await clearCart();
        showToast('Order placed successfully! 🎉', 'success');
        
        // Navigate to orders page after a short delay to show the toast
        setTimeout(() => {
          router.push('/orders');
        }, 1500);
      } else {
        showToast(orderResponse.data.message || 'Failed to place order', 'error');
      }
    } catch (error: any) {
      console.error('❌ Order placement error:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = error.message || 'Something went wrong.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Billing Address Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          {Object.keys(billingAddress).map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}${key === 'landmark' ? ' (Optional)' : ' *'}`}
              value={billingAddress[key as keyof BillingAddress]}
              onChangeText={(text) => handleInputChange(key as keyof BillingAddress, text)}
            />
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCard size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>
          <View style={styles.paymentMethod}>
            <Truck size={20} color="#10B981" />
            <Text style={styles.paymentText}>Pay on Delivery</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Delivery Fee</Text>
            <Text>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          {appliedCoupon && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountText}>Coupon Discount</Text>
              <Text style={styles.discountText}>-₹{appliedCoupon.discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          style={[styles.orderButton, placingOrder && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
          activeOpacity={0.8}
        >
          {placingOrder ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" style={styles.loadingIcon} />
              <Text style={styles.orderButtonText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.orderButtonIcon}>🛒</Text>
              <Text style={styles.orderButtonText}>Confirm Order • ₹{finalTotal}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContainer: { 
    padding: 16,
    paddingBottom: 100, // Extra padding to account for bottom button
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E0F2F1',
    borderRadius: 6,
  },
  paymentText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#047857',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountText: {
    color: '#10B981',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  orderButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#4F46E5', // Primary blue background
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 120, // Position above the bottom button
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