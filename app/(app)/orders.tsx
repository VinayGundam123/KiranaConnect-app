import axios from 'axios';
import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Clock,
    MapPin,
    Package,
    Star,
    Truck
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  deliveryAddress: string;
  storeName: string;
  storeId: string;
  paymentMethod: string;
}

const API_BASE_URL = 'https://vigorously-more-impala.ngrok-free.app';
const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await getCurrentSession();
      if (!session?.user?._id) {
        throw new Error('Please log in to view orders');
      }

      console.log(`🔍 Fetching orders for buyer ${session.user._id}`);
      const response = await axios.get(`${API_BASE_URL}/buyer/orders/${session.user._id}`, {
        headers: NGROK_HEADER
      });
      
      console.log('📦 Orders response:', response.data);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        console.log(`✅ Loaded ${response.data.orders?.length || 0} orders`);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
        console.error('❌ API returned error:', response.data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      if (error.response?.status === 404) {
        setError('No orders found');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const session = await getCurrentSession();
      if (!session?.user?._id) {
        Alert.alert('Error', 'Please log in to cancel orders');
        return;
      }

      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log(`🔄 Cancelling order ${orderId}`);
                
                const response = await axios.put(`${API_BASE_URL}/buyer/orders/${session.user._id}/${orderId}/cancel`, {}, {
                  headers: NGROK_HEADER
                });
                
                if (response.data.success) {
                  setOrders(prev => prev.map(order => 
                    order.orderId === orderId 
                      ? { ...order, status: 'Cancelled' }
                      : order
                  ));
                  Alert.alert('Success', 'Order cancelled successfully');
                } else {
                  Alert.alert('Error', response.data.message || 'Failed to cancel order');
                }
              } catch (error: any) {
                console.error('❌ Error cancelling order:', error);
                Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to cancel order');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'Processing':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
      case 'Shipped':
        return { backgroundColor: '#E0E7FF', color: '#5B21B6' };
      case 'Delivered':
        return { backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'Cancelled':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTrackOrder = async (orderId: string) => {
    try {
      const session = await getCurrentSession();
      if (!session?.user?._id) {
        Alert.alert('Error', 'Please log in to track orders');
        return;
      }

      console.log(`🔄 Tracking order ${orderId}`);
      
      const response = await axios.get(`${API_BASE_URL}/buyer/orders/${session.user._id}/${orderId}/track`, {
        headers: NGROK_HEADER
      });
      
      if (response.data.success) {
        const tracking = response.data.tracking;
        Alert.alert(
          'Order Tracking',
          `Order ${orderId} is ${tracking.status}.\nEstimated delivery: ${new Date(tracking.estimatedDelivery).toLocaleDateString()}`
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to track order');
      }
    } catch (error: any) {
      console.error('❌ Error tracking order:', error);
      Alert.alert('Error', 'Order tracking coming soon!');
    }
  };

  const handleReorder = (orderId: string) => {
    Alert.alert('Reorder', 'Reorder functionality coming soon!');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const statusStyle = getStatusColor(order.status);
    
    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.storeInfo}>
            <View style={styles.storeImageContainer}>
              <Text style={styles.storeInitial}>{order.storeName.charAt(0)}</Text>
            </View>
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{order.storeName}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.rating}>4.8</Text>
              </View>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {order.status}
              </Text>
            </View>
            <Text style={styles.orderId}>#{order.orderId}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.itemsSummary} numberOfLines={1}>
            {order.items.map(item => `${item.quantity}${item.unit} ${item.name}`).join(', ')}
          </Text>
          <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
        </View>
        
        <View style={styles.orderMeta}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.orderDate}>Ordered on {formatDate(order.orderDate)}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
          >
            <Text style={styles.expandButtonText}>
              {expandedOrder === order.orderId ? 'Less Details' : 'More Details'}
            </Text>
            {expandedOrder === order.orderId ? (
              <ChevronUp size={16} color="#4F46E5" />
            ) : (
              <ChevronDown size={16} color="#4F46E5" />
            )}
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            {order.status === 'Pending' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order.orderId)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            {(order.status === 'Shipped' || order.status === 'Processing') && (
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() => handleTrackOrder(order.orderId)}
              >
                <Truck size={16} color="white" />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            )}
            {order.status === 'Delivered' && (
              <TouchableOpacity
                style={styles.reorderButton}
                onPress={() => handleReorder(order.orderId)}
              >
                <Package size={16} color="#4F46E5" />
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Expanded Details */}
        {expandedOrder === order.orderId && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailsRow}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Delivery Details</Text>
                <View style={styles.detailItem}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{order.deliveryAddress}</Text>
                </View>
                {order.status === 'Delivered' && (
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      Delivered on {formatDate(order.orderDate)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Order Details</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemDetail}>
                  <Text style={styles.itemName}>
                    {item.quantity}{item.unit} {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
              ))}
              <View style={styles.totalDetail}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
              </View>
              <Text style={styles.paymentMethod}>
                Paid via {order.paymentMethod}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Orders</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={fetchOrders} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                selectedStatus === status && styles.filterChipActive
              ]}
              onPress={() => setSelectedStatus(status as any)}
            >
              <Text style={[
                styles.filterChipText,
                selectedStatus === status && styles.filterChipTextActive
              ]}>
                {status === 'all' ? 'All' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? "Try adjusting your search query"
              : "You haven't placed any orders yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsSummary: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reorderButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reorderButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsRow: {
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 