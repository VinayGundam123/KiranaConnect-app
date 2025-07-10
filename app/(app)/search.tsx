import { Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { useProducts } from '../../lib/hooks';
import { theme } from '../../lib/theme';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize search parameters to prevent unnecessary re-renders
  const searchParams = useMemo(() => {
    const params: { category?: string; search?: string; limit?: number } = {
      limit: 20 // Reasonable limit for search results
    };
    
    if (category && category !== 'all') {
      params.category = category;
    }
    
    if (debouncedQuery.trim()) {
      params.search = debouncedQuery.trim();
    }
    
    // Only return params if we have something to search for
    return Object.keys(params).length > 1 ? params : undefined;
  }, [category, debouncedQuery]);

  // Only fetch products when we have search criteria
  const shouldFetch = !!(searchParams);
  
  // Fetch products based on search parameters (only when needed)
  const { data: products, loading, error, refetch } = useProducts(
    shouldFetch ? searchParams : undefined
  );

  const categories = [
    { id: 'all', name: 'All', color: '#6366f1' },
    { id: 'groceries', name: 'Groceries', color: '#10b981' },
    { id: 'vegetables', name: 'Vegetables', color: '#f59e0b' },
    { id: 'dairy', name: 'Dairy', color: '#ef4444' },
    { id: 'snacks', name: 'Snacks', color: '#8b5cf6' },
  ];

  const handleCategoryPress = (categoryId: string) => {
    setCategory(categoryId === 'all' ? '' : categoryId);
  };

  const filteredProducts = products || [];
  const hasSearchCriteria = searchQuery.trim() || category;
  const showResults = hasSearchCriteria && shouldFetch;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text variant="h4" style={styles.title}>Search Products</Text>
        
        {/* Search Input */}
        <Card style={styles.searchCard}>
          <Input
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search color="#6b7280" size={20} />}
          />
        </Card>

        {/* Category Filters */}
        <Card style={styles.categoriesCard}>
          <Text variant="h6" style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id || (cat.id === 'all' && !category) ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => handleCategoryPress(cat.id)}
                  style={styles.categoryButton}
                >
                  {cat.name}
                </Button>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Search Results */}
        <Card style={styles.resultsCard}>
          {!hasSearchCriteria ? (
            <View style={styles.emptyState}>
              <Text variant="h6" style={styles.emptyTitle}>Start Searching</Text>
              <Text style={styles.emptyMessage}>
                Enter a search term or select a category to find products
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Searching products...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading products</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Button onPress={refetch} style={styles.retryButton}>
                Retry
              </Button>
            </View>
          ) : showResults ? (
            <>
              <Text variant="h6" style={styles.sectionTitle}>
                {filteredProducts.length} products found
              </Text>
              
              {filteredProducts.length > 0 ? (
                <View style={styles.productsGrid}>
                  {filteredProducts.map((product: any) => (
                    <Card key={product._id} style={styles.productCard}>
                      <Image
                        source={{
                          uri: product.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'
                        }}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text variant="body" style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>₹{product.price}</Text>
                        <Text style={styles.productStore}>{product.storeName}</Text>
                        <Button size="sm" style={styles.addButton}>
                          Add to Cart
                        </Button>
                      </View>
                    </Card>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text variant="h6" style={styles.emptyTitle}>No products found</Text>
                  <Text style={styles.emptyMessage}>
                    Try adjusting your search terms or browse different categories
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.lg,
    color: '#111827',
    textAlign: 'center',
  },
  searchCard: {
    marginBottom: theme.spacing.md,
  },
  categoriesCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: '#111827',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  categoryButton: {
    marginRight: theme.spacing.sm,
  },
  resultsCard: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  productName: {
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#4F46E5',
    marginBottom: theme.spacing.xs,
  },
  productStore: {
    fontSize: theme.fontSize.sm,
    color: '#6b7280',
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: '#6b7280',
  },
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    color: '#6b7280',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    marginBottom: theme.spacing.sm,
    color: '#111827',
  },
  emptyMessage: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 