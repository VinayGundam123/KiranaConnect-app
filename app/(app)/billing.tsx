import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, MapPin, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getCurrentSession } from '../../lib/auth';
import { Button } from '../components/ui/button';
import { SafeAreaView } from '../components/ui/safe-area-view';
import { useCart } from './_layout';

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

  const handleInputChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    for (const [key, value] of Object.entries(billingAddress)) {
      if (key !== 'landmark' && !value.trim()) {
        Alert.alert('Validation Error', `Please fill in your ${key}.`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setPlacingOrder(true);
    try {
      const session = await getCurrentSession();
      if (!session?.user?._id) throw new Error('You must be logged in.');

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
        Alert.alert('Order Placed!', 'Your order has been placed successfully.', [
          { text: 'OK', onPress: () => router.replace('/(app)/home') },
        ]);
      } else {
        throw new Error(orderResponse.data.message || 'Failed to place order.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        <Button onPress={handlePlaceOrder} disabled={placingOrder} style={styles.placeOrderButton}>
          {placingOrder ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Confirm Order</Text>
          )}
        </Button>
      </ScrollView>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContainer: { padding: 16 },
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
  placeOrderButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 