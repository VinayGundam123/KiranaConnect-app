import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWishlist } from '../../_layout';
import { Button } from './button';
import { Card } from './card';
import { Text } from './text';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    storeName: string;
    storeId: string;
    category?: string;
    unit?: string;
  };
  onWishlistToggle?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  variant?: 'default' | 'compact';
}

export function ProductCard({
  product,
  onWishlistToggle,
  onAddToCart,
  variant = 'default',
}: ProductCardProps) {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistToggle = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        itemId: product._id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        unit: product.unit || 'piece',
        storeName: product.storeName,
        storeId: product.storeId,
        category: product.category || 'General',
      });
    }
    onWishlistToggle?.(product);
  };

  const handleProductPress = () => {
    router.push(`/products/${product._id}` as any);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={handleProductPress}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.image || 'https://via.placeholder.com/300x300?text=No+Image',
            }}
            style={styles.image}
          />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productUnit}>
            {product.unit || 'piece'}
          </Text>
          <Text style={styles.price}>
            ₹{product.price}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
          >
            <Heart
              color={
                isInWishlist(product._id)
                  ? '#EF4444' 
                  : '#9CA3AF'
              }
              fill={
                isInWishlist(product._id)
                  ? '#EF4444'
                  : 'none'
              }
              size={20}
            />
          </TouchableOpacity>
          <Button
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>Add</Text>
          </Button>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 6,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#F8F9FA',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    padding: 12,
    minHeight: 80,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  productUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wishlistButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addToCartButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 