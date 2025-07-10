import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Heart, ShoppingCart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWishlist } from '../../_layout';
import { Button } from '../../components/ui/button';
import { SafeAreaView } from '../../components/ui/safe-area-view';

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  images: string[];
  unit: string;
  storeName: string;
  storeId: string;
  sellerName: string;
  sellerAddress: string;
  sellerLicense: string;
  refundPolicy: string;
  customerCare: string;
  nutritionInfo: string;
}

interface SimilarProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  storeName: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000); // Hide after 2 seconds
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://vigorously-more-impala.ngrok-free.app/buyer/products/${productId}`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const productData = response.data.product;

        if (!productData) {
          setError('Product data not found in API response.');
          setLoading(false);
          return;
        }

        const completeProductData: Product = {
          ...productData,
          images:
            productData.images && productData.images.length > 0
              ? productData.images
              : ['https://via.placeholder.com/600x600?text=No+Image'],
          nutritionInfo:
            'Energy (kcal) 76.6, Protein (g) 2.5, Carbohydrate (g) 12.6, Sugar (g) 8.4, Sodium (mg) 28.9, Fat (g) 1.9',
          customerCare:
            'In case of any issue, contact us E-mail address:\nsupport@sparsoft.com',
          refundPolicy: 'Refunds/complaints window is 12 hrs',
        };
        setProduct(completeProductData);
        setSelectedImage(completeProductData.images[0]);
        if (completeProductData.category) {
          fetchSimilarProducts(
            completeProductData.category,
            completeProductData._id
          );
        }
      } catch (err: any) {
        console.error('Failed to fetch product details:', err);
        const errorMessage =
          err.response?.data?.error ||
          'Failed to load product details. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarProducts = async (
      category: string,
      currentProductId: string
    ) => {
      try {
        const response = await axios.get(
          `https://vigorously-more-impala.ngrok-free.app/buyer/products?category=${category}&limit=5`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        if (response.data.products) {
          const mappedProducts = response.data.products
            .filter((p: any) => p._id !== currentProductId)
            .map((p: any) => ({
              _id: p._id,
              name: p.name,
              price: p.price,
              image:
                p.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
              storeName: p.storeName,
            }));
          setSimilarProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch similar products:', err);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    Alert.alert('Success', `${product.name} added to cart`);
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showToast('Removed from wishlist');
    } else {
      addToWishlist({
        itemId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        unit: product.unit,
        storeName: product.storeName,
        storeId: product.storeId,
        category: product.category,
      });
      showToast('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View style={styles.container}>
          {/* Main content grid */}
          <View style={styles.gridContainer}>
            {/* Left Column: Image Gallery & Actions */}
            <View style={styles.leftColumn}>
              <View style={styles.galleryContainer}>
                <View style={styles.thumbnailsColumn}>
                  {product.images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(img)}
                    >
                      <Image
                        source={{ uri: img }}
                        style={[
                          styles.thumbnail,
                          selectedImage === img && styles.selectedThumbnail,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.mainImageContainer}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  onPress={handleAddToCart}
                  style={styles.addToCartButton}
                >
                  <ShoppingCart
                    color="white"
                    size={20}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Add To Cart
                  </Text>
                </Button>
                <Button
                  variant="outline"
                  onPress={handleWishlistToggle}
                  style={styles.wishlistButton}
                >
                  <Heart
                    size={20}
                    style={{ marginRight: 8 }}
                    color={isInWishlist(product._id) ? 'red' : 'black'}
                    fill={isInWishlist(product._id) ? 'red' : 'none'}
                  />
                  <Text>{isInWishlist(product._id) ? 'Saved' : 'Save'}</Text>
                </Button>
              </View>
            </View>

            {/* Right Column: Information */}
            <View style={styles.rightColumn}>
              <View style={styles.infoContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productUnit}>{product.unit}</Text>
                <Text style={styles.productPrice}>
                  {typeof product.price === 'number'
                    ? `₹${product.price.toFixed(2)}`
                    : 'Price not available'}
                </Text>
                {product.description && (
                  <Text style={styles.productDescription}>
                    {product.description}
                  </Text>
                )}

                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Information</Text>
                  <InfoRow
                    label="Nutrition Information"
                    value={product.nutritionInfo}
                  />
                  <InfoRow
                    label="Customer Care Details"
                    value={product.customerCare}
                  />
                  <InfoRow
                    label="Refund Policy"
                    value={product.refundPolicy}
                  />
                  <InfoRow label="Seller Name" value={product.sellerName} />
                  <InfoRow
                    label="Seller Address"
                    value={product.sellerAddress}
                  />
                  <InfoRow
                    label="Seller License No."
                    value={product.sellerLicense}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.similarProductsContainer}>
              <Text style={styles.similarProductsTitle}>Similar Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarProducts.map(p => (
                  <TouchableOpacity
                    key={p._id}
                    style={styles.similarProductCard}
                    onPress={() =>
                      router.replace(`/products/${p._id}` as any)
                    }
                  >
                    <Image
                      source={{ uri: p.image }}
                      style={styles.similarProductImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.similarProductName} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <Text style={styles.similarProductPrice}>₹{p.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  gridContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  galleryContainer: { flexDirection: 'row', gap: 16, minHeight: 300 },
  thumbnailsColumn: { flexDirection: 'column', gap: 16 },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedThumbnail: { borderColor: '#3B82F6' },
  mainImageContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
  },
  mainImage: { width: '100%', height: '100%' },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  addToCartButton: { flex: 1, backgroundColor: '#0ea5e9', borderRadius: 8 },
  wishlistButton: { flexBasis: 120 },
  infoContainer: { gap: 8 },
  productName: { fontSize: 28, fontWeight: 'bold' },
  productUnit: { fontSize: 16, color: '#6B7280' },
  productPrice: { fontSize: 28, fontWeight: 'bold' },
  productDescription: { fontSize: 16, color: '#374151', lineHeight: 24 },
  infoBox: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoBoxTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  infoRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  infoRowLabel: { fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  infoRowValue: { color: '#1F2937' },
  similarProductsContainer: { marginTop: 24, paddingLeft: 16 },
  similarProductsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  similarProductCard: {
    width: 150,
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  similarProductImage: { width: '100%', height: 100, marginBottom: 8 },
  similarProductName: { fontWeight: '600', textAlign: 'center' },
  similarProductPrice: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
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
  },
}); 