import { Clock, MapPin, Star } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card } from '../ui/card';
import { Text } from '../ui/text';

export interface Store {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  deliveryTime: string;
  distance?: string;
  categories?: string[];
  offer?: string;
}

interface StoreCardProps {
  store: Store;
  onPress: () => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri: store.imageUrl }} style={styles.image} />
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFC107" />
          <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
        </View>
        
        <View style={styles.content}>
          <Text variant="h4" style={styles.name}>{store.name}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {store.description}
          </Text>
          
          <View style={styles.infoRow}>
            {store.distance && (
              <View style={styles.infoItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.infoText}>{store.distance}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.infoText}>{store.deliveryTime}</Text>
            </View>
          </View>
          
          {store.categories && (
            <View style={styles.categoriesContainer}>
              {store.categories.slice(0, 3).map((category) => (
                <View key={category} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          )}

          {store.offer && (
            <View style={styles.offerContainer}>
              <Text style={styles.offerText}>{store.offer}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 12, // Reduced from 16
    maxWidth: 280,
    minWidth: 240,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  ratingContainer: {
    position: 'absolute',
    top: 6, // Reduced from 8
    right: 6, // Reduced from 8
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12, // Reduced from 16
    paddingVertical: 3, // Reduced from 4
    paddingHorizontal: 6, // Reduced from 8
  },
  ratingText: {
    marginLeft: 3, // Reduced from 4
    fontWeight: '600',
    fontSize: 13, // Reduced from 14
  },
  content: {
    padding: 8, // Reduced from 12
  },
  name: {
    marginBottom: 2, // Reduced from 4
    flexShrink: 1,
    fontSize: 15, // Reduced from 16
    fontWeight: '600',
  },
  description: {
    color: '#6B7280',
    fontSize: 12, // Reduced from 13
    marginBottom: 6, // Reduced from 8
    flexShrink: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, // Reduced from 16
  },
  infoText: {
    marginLeft: 3, // Reduced from 4
    color: '#6B7280',
    fontSize: 11, // Reduced from 12
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3, // Reduced from 4
    marginBottom: 6, // Reduced from 8
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12, // Reduced from 16
    paddingVertical: 3, // Reduced from 4
    paddingHorizontal: 8, // Reduced from 10
  },
  categoryText: {
    fontSize: 11, // Reduced from 12
    color: '#374151',
  },
  offerContainer: {
    backgroundColor: '#E0F2F1',
    borderRadius: 12, // Reduced from 16
    paddingVertical: 3, // Reduced from 4
    paddingHorizontal: 8, // Reduced from 10
    alignSelf: 'flex-start',
  },
  offerText: {
    fontSize: 11, // Reduced from 12
    color: '#0D9488',
    fontWeight: '600',
  },
}); 