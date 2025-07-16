import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { Archive, Minus, Plus, ShoppingBag, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { useHeader } from '../../lib/header-context';

interface BasketItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  companyPreference: string;
  category?: string;
}

interface Basket {
  id: string;
  name: string;
  items: BasketItem[];
  createdAt: Date;
  status: 'draft' | 'completed' | 'archived';
  totalItems: number;
}

export default function BasketsScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  
  // Current basket state
  const [currentBasket, setCurrentBasket] = useState<BasketItem[]>([]);
  const [basketName, setBasketName] = useState('');
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    companyPreference: '',
    category: '',
  });
  
  // Previous baskets state
  const [previousBaskets, setPreviousBaskets] = useState<Basket[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle('Basket Management');
    loadPreviousBaskets();
    
    return () => {
      setTitle(null);
    };
  }, [setTitle]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const loadPreviousBaskets = async () => {
    try {
      const stored = await AsyncStorage.getItem('userBaskets');
      if (stored) {
        const baskets = JSON.parse(stored);
        setPreviousBaskets(baskets);
      }
    } catch (error) {
      console.error('Failed to load baskets:', error);
    }
  };

  const saveBasket = async (basket: Basket) => {
    try {
      const updatedBaskets = [basket, ...previousBaskets];
      await AsyncStorage.setItem('userBaskets', JSON.stringify(updatedBaskets));
      setPreviousBaskets(updatedBaskets);
    } catch (error) {
      console.error('Failed to save basket:', error);
    }
  };

  const addItemToBasket = () => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    const item: BasketItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      quantity: 1,
      description: newItem.description.trim(),
      companyPreference: newItem.companyPreference.trim(),
      category: newItem.category.trim(),
    };

    setCurrentBasket(prev => [...prev, item]);
    setNewItem({ name: '', description: '', companyPreference: '', category: '' });
    showToast(`${item.name} added to basket`);
  };

  const updateItemQuantity = (itemId: string, change: number) => {
    setCurrentBasket(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItemFromBasket = (itemId: string) => {
    setCurrentBasket(prev => prev.filter(item => item.id !== itemId));
    showToast('Item removed from basket');
  };

  const saveCurrentBasket = async () => {
    if (currentBasket.length === 0) {
      Alert.alert('Error', 'Please add some items to your basket first');
      return;
    }

    if (!basketName.trim()) {
      Alert.alert('Error', 'Please enter a basket name');
      return;
    }

    const basket: Basket = {
      id: Date.now().toString(),
      name: basketName.trim(),
      items: currentBasket,
      createdAt: new Date(),
      status: 'draft',
      totalItems: currentBasket.reduce((sum, item) => sum + item.quantity, 0),
    };

    await saveBasket(basket);
    
    Alert.alert(
      'Basket Saved!',
      `Your basket "${basket.name}" has been saved with ${basket.totalItems} items.`,
      [
        { text: 'Create New', onPress: () => clearCurrentBasket() },
        { text: 'View History', onPress: () => setActiveTab('history') },
      ]
    );
  };

  const clearCurrentBasket = () => {
    setCurrentBasket([]);
    setBasketName('');
    showToast('Basket cleared');
  };

  const loadBasketToEdit = (basket: Basket) => {
    setCurrentBasket([...basket.items]);
    setBasketName(basket.name);
    setActiveTab('create');
    showToast(`Basket "${basket.name}" loaded for editing`);
  };

  const deleteBasket = async (basketId: string) => {
    const updatedBaskets = previousBaskets.filter(b => b.id !== basketId);
    setPreviousBaskets(updatedBaskets);
    await AsyncStorage.setItem('userBaskets', JSON.stringify(updatedBaskets));
    showToast('Basket deleted');
  };

  const renderCreateTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Basket Name */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>Basket Name</Text>
        <Input
          placeholder="Enter basket name (e.g., Weekly Groceries)"
          value={basketName}
          onChangeText={setBasketName}
          style={styles.basketNameInput}
        />
      </Card>

      {/* Add New Item */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>Add New Item</Text>
        <View style={styles.addItemForm}>
          <Input
            placeholder="Product name (e.g., Milk, Bread, Apples)"
            value={newItem.name}
            onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
            style={styles.formInput}
          />
          <Input
            placeholder="Category (e.g., Dairy, Bakery, Fruits)"
            value={newItem.category}
            onChangeText={(text) => setNewItem(prev => ({ ...prev, category: text }))}
            style={styles.formInput}
          />
          <Input
            placeholder="Company preference (e.g., Amul, Britannia)"
            value={newItem.companyPreference}
            onChangeText={(text) => setNewItem(prev => ({ ...prev, companyPreference: text }))}
            style={styles.formInput}
          />
          <Input
            placeholder="Additional description (optional)"
            value={newItem.description}
            onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
            style={styles.formInput}
            multiline
          />
          <Button onPress={addItemToBasket} style={styles.addButton}>
            <Plus size={16} color="white" />
            <Text style={styles.addButtonText}>Add to Basket</Text>
          </Button>
        </View>
      </Card>

      {/* Current Basket Items */}
      {currentBasket.length > 0 && (
        <Card style={styles.section}>
          <Text variant="h6" style={styles.sectionTitle}>
            Current Basket ({currentBasket.length} items)
          </Text>
          {currentBasket.map((item) => (
            <View key={item.id} style={styles.basketItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.category && (
                  <Text style={styles.itemDetail}>Category: {item.category}</Text>
                )}
                {item.companyPreference && (
                  <Text style={styles.itemDetail}>Preferred: {item.companyPreference}</Text>
                )}
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              
              <View style={styles.itemControls}>
                <TouchableOpacity 
                  onPress={() => updateItemQuantity(item.id, -1)}
                  style={styles.quantityButton}
                >
                  <Minus size={16} color="#666" />
                </TouchableOpacity>
                
                <Text style={styles.quantity}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  onPress={() => updateItemQuantity(item.id, 1)}
                  style={styles.quantityButton}
                >
                  <Plus size={16} color="#666" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => removeItemFromBasket(item.id)}
                  style={styles.removeButton}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View style={styles.basketActions}>
            <Button onPress={clearCurrentBasket} variant="outline" style={styles.actionButton}>
              Clear Basket
            </Button>
            <Button onPress={saveCurrentBasket} style={styles.actionButton}>
              <ShoppingBag size={16} color="white" />
              <Text style={styles.saveButtonText}>Save Basket</Text>
            </Button>
          </View>
        </Card>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      {previousBaskets.length === 0 ? (
        <Card style={styles.section}>
          <Text style={styles.emptyText}>No previous baskets found</Text>
          <Text style={styles.emptySubtext}>Create your first basket to see it here!</Text>
        </Card>
      ) : (
        previousBaskets.map((basket) => (
          <Card key={basket.id} style={styles.basketCard}>
            <View style={styles.basketHeader}>
              <View style={styles.basketInfo}>
                <Text style={styles.basketName}>{basket.name}</Text>
                <Text style={styles.basketMeta}>
                  {basket.totalItems} items • {new Date(basket.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.basketStatus}>
                <Text style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(basket.status)
                }}>
                  {basket.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.basketItems}>
              {basket.items.slice(0, 3).map((item, index) => (
                <Text key={index} style={styles.previewItem}>
                  • {item.name} ({item.quantity}x)
                  {item.companyPreference && ` - ${item.companyPreference}`}
                </Text>
              ))}
              {basket.items.length > 3 && (
                <Text style={styles.moreItems}>
                  +{basket.items.length - 3} more items
                </Text>
              )}
            </View>
            
            <View style={styles.basketActions}>
              <Button
                variant="outline"
                size="sm"
                onPress={() => loadBasketToEdit(basket)}
                style={styles.actionButton}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  Alert.alert(
                    'Delete Basket',
                    `Are you sure you want to delete "${basket.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteBasket(basket.id) },
                    ]
                  );
                }}
                style={styles.actionButton}
              >
                Delete
              </Button>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'archived': return '#6B7280';
      default: return '#F59E0B';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={{
            ...styles.tab,
            ...(activeTab === 'create' ? styles.activeTab : {})
          }}
          onPress={() => setActiveTab('create')}
        >
          <Plus size={20} color={activeTab === 'create' ? '#4F46E5' : '#6B7280'} />
          <Text style={{
            ...styles.tabText,
            ...(activeTab === 'create' ? styles.activeTabText : {})
          }}>
            Create Basket
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            ...styles.tab,
            ...(activeTab === 'history' ? styles.activeTab : {})
          }}
          onPress={() => setActiveTab('history')}
        >
          <Archive size={20} color={activeTab === 'history' ? '#4F46E5' : '#6B7280'} />
          <Text style={{
            ...styles.tabText,
            ...(activeTab === 'history' ? styles.activeTabText : {})
          }}>
            History ({previousBaskets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'create' ? renderCreateTab() : renderHistoryTab()}

      {/* Toast */}
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
    backgroundColor: '#F9FAFB',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#111827',
    fontWeight: '600',
  },
  basketNameInput: {
    fontSize: 16,
  },
  addItemForm: {
    // gap: 12, // Removed gap property for React Native Web compatibility
  },
  formInput: {
    fontSize: 14,
    marginBottom: 12, // Added margin instead of gap
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4, // Added margin for spacing
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  basketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#4F46E5',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 8, // Removed gap property for React Native Web compatibility
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginHorizontal: 4, // Added margin instead of gap
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
    marginHorizontal: 4, // Added margin for spacing
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginLeft: 8, // Added margin for spacing
  },
  basketActions: {
    flexDirection: 'row',
    // gap: 12, // Removed gap property for React Native Web compatibility
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6, // Added margin instead of gap
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  basketCard: {
    marginBottom: 16,
    padding: 16,
  },
  basketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  basketInfo: {
    flex: 1,
  },
  basketName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  basketMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  basketStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  basketItems: {
    marginBottom: 16,
  },
  previewItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
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