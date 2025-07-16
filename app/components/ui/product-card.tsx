import { Heart, ShoppingCart } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Theme object with proper color definitions
const theme = {
  colors: {
    white: '#FFFFFF',
    primary: {
      600: '#4F46E5',
    },
    gray: {
      400: '#9CA3AF',
      500: '#6B7280',
      800: '#1F2937',
      600: '#4B5563',
    },
    red: {
      50: '#FEF2F2',
      500: '#EF4444',
    },
  },
};

interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image?: string;
  image_url?: string;
  storeName?: string;
  storeId?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onWishlistToggle: () => void;
  isInWishlist?: boolean;
  onPress?: () => void; // Add optional onPress callback
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  isInWishlist = false,
  onPress, // Add onPress to destructured props
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: product.image || product.image_url || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'
        }}
        style={styles.image}
      />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.price}>
          ₹{product.price}/{product.unit}
        </Text>
        
        {product.storeName && (
          <Text style={styles.storeName} numberOfLines={1}>
            {product.storeName}
          </Text>
        )}

        <Text style={styles.category}>
          {product.category}
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.wishlistButton, isInWishlist && styles.wishlistButtonActive]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering card onPress
              onWishlistToggle();
            }}
          >
            <Heart 
              size={16} 
              color={isInWishlist ? theme.colors.red[500] : theme.colors.gray[400]}
              fill={isInWishlist ? theme.colors.red[500] : 'none'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering card onPress
              onAddToCart();
            }}
          >
            <ShoppingCart size={14} color={theme.colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wishlistButton: {
    padding: 6,
    borderRadius: 6,
  },
  wishlistButtonActive: {
    backgroundColor: theme.colors.red[50],
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
}); 