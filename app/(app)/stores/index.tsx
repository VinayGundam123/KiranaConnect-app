import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useStores } from '../../../lib/hooks';
import { StoreCard } from '../../components/dashboard/StoreCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';

export default function AllStoresScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all stores (no limit for "All Stores" page)
  const { data: storesResponse, loading, error } = useStores();
  
  // Extract stores array from API response
  const storesData = storesResponse?.stores || [];

  // Memoize categories to prevent re-computation
  const categories = useMemo(() => {
    if (!storesData.length) return [];
    const allCategories = storesData.flatMap((store: any) => store.categories || []);
    return Array.from(new Set(allCategories as string[]));
  }, [storesData]);

  // Memoize filtered stores to prevent re-computation
  const filteredStores = useMemo(() => {
    if (!storesData.length) return [];
    return storesData.filter((store: any) => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || (store.categories && store.categories.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [storesData, searchQuery, selectedCategory]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Back Button and Title Section */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.titleSection}>
          <Text variant="h4" style={styles.title}>All Stores</Text>
          <Text style={styles.subtitle}>Discover local stores near you</Text>
        </View>
      </View>
      
      <Input
        placeholder="Search stores..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      
      <View style={styles.categoriesContainer}>
        <Button
          size="sm"
          variant={selectedCategory === null ? 'default' : 'outline'}
          onPress={() => setSelectedCategory(null)}
          style={styles.categoryButton}
        >
          <Text style={styles.categoryButtonText}>All Categories</Text>
        </Button>
        {categories.map((category: string) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryButton}
          >
            <Text style={styles.categoryButtonText}>{category}</Text>
          </Button>
        ))}
      </View>
    </View>
  );

  const renderStoreItem = ({ item }: { item: any }) => (
    <View style={styles.storeItemContainer}>
      <StoreCard
        store={{
          ...item,
          imageUrl: item.storeImgUrl || 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          description: item.storeAddress || 'No address provided',
          deliveryTime: '30-45 min',
          categories: item.categories || [],
          distance: item.storeAddress || 'N/A',
          offer: 'No current offer', // Default offer
        }}
        onPress={() =>
          router.push({
            pathname: '/stores/[storeId]',
            params: { storeId: item._id },
          })
        }
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading stores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Error loading stores. Please try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredStores}
        keyExtractor={(item: any) => item._id}
        ListHeaderComponent={renderHeader}
        renderItem={renderStoreItem}
        numColumns={1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No stores found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginTop: -4, // Align with title
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchInput: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  storeItemContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 