import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';
import { useCart } from '../../lib/cart';
import { useDataContext } from '../../lib/data-context';
import { theme } from '../../lib/theme';
import { useWishlist } from '../_layout';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const router = useRouter();
  
  const { searchProducts, allProducts, loading, error, refreshData } = useDataContext();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Debug logs
  useEffect(() => {
    console.log('🔍 Search Debug Info:');
    console.log('- Total products loaded:', allProducts.length);
    console.log('- Loading state:', loading);
    console.log('- Error state:', error);
    console.log('- Search query:', searchQuery);
    console.log('- Selected category:', selectedCategory);
    if (allProducts.length > 0) {
      console.log('- Sample product:', allProducts[0]);
    }
  }, [allProducts, loading, error, searchQuery, selectedCategory]);

  // Get unique categories from all products
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allProducts.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [allProducts]);

  // Perform search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && !selectedCategory) {
      console.log('🔍 No search criteria - returning empty results');
      return [];
    }
    const results = searchProducts(searchQuery, selectedCategory);
    console.log('🔍 Search results:', results.length, 'products found');
    console.log('🔍 Search query:', searchQuery, 'Category:', selectedCategory);
    if (results.length > 0) {
      console.log('🔍 First result:', results[0].name);
    }
    return results;
  }, [searchQuery, selectedCategory, searchProducts]);

  const hasSearchCriteria = searchQuery.trim() || selectedCategory;

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart({
        ...product,
        itemId: product._id,
        storeId: product.storeId,
        storeName: product.storeName,
      }, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleWishlistToggle = async (product: any) => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist({
          ...product,
          itemId: product._id,
          storeId: product.storeId,
          storeName: product.storeName,
        });
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
    }
  };

  const navigateToProduct = (productId: string) => {
    router.push(`/(app)/products/${productId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h6" style={styles.errorTitle}>Unable to load products</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={refreshData} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <Card style={styles.searchCard}>
          <Input
            placeholder="Search for products, stores, categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search color={theme.colors.gray[500]} size={20} />}
            style={styles.searchInput}
          />
          {/* Debug Info */}
          <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>
              Debug: {allProducts.length} products loaded | Query: "{searchQuery}" | Results: {searchResults.length}
            </Text>
            <Button
              size="sm"
              onPress={() => setSearchQuery('soap')}
              style={{ marginTop: 4 }}
            >
              Test Search "soap"
            </Button>
          </View>
        </Card>

        {/* Category Filters */}
        <Card style={styles.categoriesCard}>
          <Text variant="h6" style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              <Button
                variant={!selectedCategory ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setSelectedCategory('')}
                style={styles.categoryButton}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setSelectedCategory(category)}
                  style={styles.categoryButton}
                >
                  {category}
                </Button>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Search Results */}
        <Card style={styles.resultsCard}>
          {!hasSearchCriteria ? (
            <View style={styles.emptyState}>
              <Search size={48} color={theme.colors.gray[400]} />
              <Text variant="h6" style={styles.emptyTitle}>Universal Product Search</Text>
              <Text style={styles.emptyMessage}>
                Search across all stores and products{'\n'}
                Find exactly what you need, from any store
              </Text>
              <Text style={styles.statsText}>
                {allProducts.length} products available from all stores
              </Text>
            </View>
          ) : (
            <>
              <Text variant="h6" style={styles.resultsTitle}>
                {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'} found
                {selectedCategory && ` in ${selectedCategory}`}
              </Text>
              
              {searchResults.length > 0 ? (
                <View style={styles.productsGrid}>
                  {searchResults.map((product) => (
                    <TouchableOpacity
                      key={product._id}
                      style={styles.productCard}
                      onPress={() => navigateToProduct(product._id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{
                          uri: product.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'
                        }}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text variant="body" style={styles.productName}>
                          {product.name}
                        </Text>
                        <Text style={styles.productPrice}>₹{product.price}/{product.unit}</Text>
                        {product.storeName && (
                          <Text style={styles.productStore}>{product.storeName}</Text>
                        )}
                        <Text style={styles.productCategory}>{product.category}</Text>
                        
                        <View style={styles.productActions}>
                          <TouchableOpacity
                            style={[
                              styles.wishlistButton,
                              isInWishlist(product._id) && styles.wishlistButtonActive
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleWishlistToggle(product);
                            }}
                          >
                            <Text style={isInWishlist(product._id) ? styles.wishlistButtonTextActive : styles.wishlistButtonText}>
                              {isInWishlist(product._id) ? '♥' : '♡'}
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Search size={48} color={theme.colors.gray[400]} />
                  <Text variant="h6" style={styles.emptyTitle}>No products found</Text>
                  <Text style={styles.emptyMessage}>
                    Try different keywords or browse categories{'\n'}
                    We searched across all stores for you
                  </Text>
                </View>
              )}
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    color: theme.colors.red[600],
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary[600],
  },
  searchCard: {
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    borderRadius: 12,
  },
  categoriesCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  categoryButton: {
    marginRight: theme.spacing.xs,
  },
  resultsCard: {
    marginBottom: theme.spacing.lg,
  },
  resultsTitle: {
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.gray[800],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyMessage: {
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  statsText: {
    color: theme.colors.primary[600],
    fontSize: 14,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: theme.spacing.sm,
  },
  productName: {
    color: theme.colors.gray[800],
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: theme.colors.primary[600],
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  productStore: {
    color: theme.colors.gray[500],
    fontSize: 12,
    marginBottom: 2,
  },
  productCategory: {
    color: theme.colors.gray[400],
    fontSize: 11,
    marginBottom: theme.spacing.sm,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  wishlistButton: {
    padding: 6,
  },
  wishlistButtonActive: {
    backgroundColor: theme.colors.red[50],
    borderRadius: 4,
  },
  wishlistButtonText: {
    fontSize: 16,
    color: theme.colors.gray[400],
  },
  wishlistButtonTextActive: {
    color: theme.colors.red[500],
  },
  addButton: {
    flex: 1,
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 