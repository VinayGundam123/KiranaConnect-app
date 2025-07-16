import axios from 'axios';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text as NativeText,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../../components/ui/button';
import { SafeAreaView } from '../../../components/ui/safe-area-view';
import { Text } from '../../../components/ui/text';
import { useCart } from '../../../lib/cart';
import { theme } from '../../../lib/theme';
import { useWishlist } from '../../_layout';

// Interfaces based on your ProductDetailPage.tsx
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
  // Placeholder fields
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

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching product with ID:', productId);
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `https://vigorously-more-impala.ngrok-free.app/buyer/products/${productId}`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        
        console.log('📡 API Response Status:', response.status);
        console.log('📦 API Response Data:', JSON.stringify(response.data, null, 2));
        
        if (!response.data) {
          console.error('❌ No data in response');
          setError('Product data not found in API response.');
          return;
        }
        
        // Check if response.data has the product or if response.data IS the product
        const productData = response.data.product || response.data;
        
        if (!productData || !productData._id) {
          console.error('❌ No product data or missing _id:', productData);
          setError('Product data not found in API response.');
          return;
        }
        
        console.log('✅ Product data found:', productData);
        
        const completeProductData: Product = {
          ...productData,
          images: productData.images?.length > 0 ? productData.images : ['https://via.placeholder.com/600x600?text=No+Image'],
          nutritionInfo: 'Energy (kcal) 76.6, Protein (g) 2.5, ...',
          customerCare: 'Email: support@sparsoft.com',
          refundPolicy: 'Refunds available within 12 hours of delivery.',
        };
        
        console.log('✅ Complete product data:', completeProductData);
        setProduct(completeProductData);
        setSelectedImage(completeProductData.images[0]);
        
        if (completeProductData.category) {
          fetchSimilarProducts(completeProductData.category, completeProductData._id);
        }
      } catch (err: any) {
        console.error('❌ Error fetching product:', err);
        console.error('❌ Error response:', err.response?.data);
        const errorMessage = err.response?.data?.error || 'Failed to load product details.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarProducts = async (category: string, currentProductId: string) => {
      try {
        const response = await axios.get(
          `https://vigorously-more-impala.ngrok-free.app/buyer/products?category=${category}&limit=5`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        if (response.data.products) {
          const mappedProducts = response.data.products
            .filter((p: any) => p._id !== currentProductId)
            .map((p: any) => ({
              _id: p._id,
              name: p.name,
              price: p.price,
              image: p.image_url || 'https://via.placeholder.com/300x300',
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

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, 1);
      showToast(`${product.name} added to cart`);
    } catch (err) {
      showToast('Failed to add item to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        showToast('Removed from wishlist');
      } else {
        await addToWishlist({ ...product, itemId: product._id });
        showToast('Added to wishlist');
      }
    } catch (err) {
      showToast('Failed to update wishlist');
    }
  };

  const onShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out this product: ${product.name} on KiranaConnect!`,
        url: `exp://u.expo.dev/update/4f057863-42e8-4e08-9ad5-a46e1fac9913`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Loading Product...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View style={styles.imageGallery}>
          <Image source={{ uri: selectedImage }} style={styles.mainImage} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailContainer}>
            {product.images.map((img, index) => (
              <TouchableOpacity key={index} onPress={() => setSelectedImage(img)}>
                <Image
                  source={{ uri: img }}
                  style={[styles.thumbnail, selectedImage === img && styles.selectedThumbnail]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <Text variant="h4" style={styles.productName}>{product.name}</Text>
            <TouchableOpacity onPress={onShare}>
              <Share2 size={24} color={theme.colors.gray[500]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.productUnit}>{product.unit}</Text>
          <Text style={styles.productPrice}>₹{product.price.toFixed(2)}</Text>
          
          <View style={styles.storeInfo}>
            <Star size={16} color={theme.colors.yellow[500]} fill={theme.colors.yellow[500]} />
            <Text style={styles.storeName}>{product.storeName}</Text>
          </View>

          {product.description && <Text style={styles.description}>{product.description}</Text>}

          <View style={styles.infoSection}>
            <InfoRow label="Nutrition Information" value={product.nutritionInfo} />
            <InfoRow label="Customer Care" value={product.customerCare} />
            <InfoRow label="Refund Policy" value={product.refundPolicy} />
            <InfoRow label="Seller" value={product.sellerName} />
            <InfoRow label="Seller Address" value={product.sellerAddress} />
          </View>
        </View>

        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <Text variant="h6" style={styles.similarTitle}>Similar Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similarProducts.map(p => (
                <Link key={p._id} href={{ pathname: '/(app)/products/[productId]', params: { productId: p._id } }} asChild>
                  <TouchableOpacity style={styles.similarCard}>
                      <Image source={{ uri: p.image }} style={styles.similarImage} />
                      <NativeText style={styles.similarName} numberOfLines={2}>{p.name}</NativeText>
                      <Text style={styles.similarPrice}>₹{p.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button variant="outline" onPress={handleWishlistToggle} style={styles.wishlistButton}>
          <Heart size={22} color={isInWishlist(product._id) ? theme.colors.red[500] : theme.colors.gray[600]} fill={isInWishlist(product._id) ? theme.colors.red[500] : 'none'} />
        </Button>
        <Button onPress={handleAddToCart} style={styles.cartButton}>
          <ShoppingCart size={22} color="white" style={{ marginRight: 8 }}/>
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </Button>
      </View>

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
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 18, color: theme.colors.gray[600] },
  errorText: { fontSize: 18, color: theme.colors.red[500], textAlign: 'center', padding: 16 },
  imageGallery: { backgroundColor: theme.colors.gray[100] },
  mainImage: { width: '100%', height: 350, resizeMode: 'contain' },
  thumbnailContainer: { padding: 16 },
  thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  selectedThumbnail: { borderColor: theme.colors.primary[500] },
  detailsContainer: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { flex: 1, fontWeight: 'bold' },
  productUnit: { fontSize: 16, color: theme.colors.gray[500], marginTop: 4 },
  productPrice: { fontSize: 28, fontWeight: 'bold', color: theme.colors.gray[800], marginVertical: 12 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: theme.colors.gray[50], borderRadius: 8, alignSelf: 'flex-start' },
  storeName: { fontWeight: '500' },
  description: { fontSize: 16, color: theme.colors.gray[600], lineHeight: 24, marginVertical: 16 },
  infoSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.gray[200] },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.gray[200] },
  infoLabel: { fontSize: 15, color: theme.colors.gray[600], fontWeight: '500' },
  infoValue: { fontSize: 15, color: theme.colors.gray[800], flex: 1, textAlign: 'right' },
  similarSection: { padding: 16, backgroundColor: theme.colors.gray[50], borderTopWidth: 8, borderColor: theme.colors.gray[100] },
  similarTitle: { fontWeight: 'bold', marginBottom: 12 },
  similarCard: { width: 140, marginRight: 16, backgroundColor: 'white', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: theme.colors.gray[200] },
  similarImage: { width: '100%', height: 100, resizeMode: 'contain', marginBottom: 8 },
  similarName: { fontSize: 14, fontWeight: '500' },
  similarPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  bottomBar: { flexDirection: 'row', padding: 16, gap: 16, borderTopWidth: 1, borderColor: theme.colors.gray[200], backgroundColor: 'white' },
  wishlistButton: { paddingHorizontal: 20 },
  cartButton: { flex: 1 },
  cartButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  toastContainer: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 20, padding: 16, alignItems: 'center' },
  toastText: { color: 'white', fontWeight: 'bold' },
}); 