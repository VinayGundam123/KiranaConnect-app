import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Clock, Star } from 'lucide-react-native';
import { Button } from '../ui/button';

interface StoreCardProps {
  store: {
    name: string;
    description: string;
    imageUrl: string;
    rating: number;
    deliveryTime: string;
  };
  onPress: () => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: store.imageUrl }} style={styles.image} />
      <View style={styles.ratingContainer}>
        <Star color="#FBBF24" fill="#FBBF24" size={16} />
        <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{store.name}</Text>
        <Text style={styles.description}>{store.description}</Text>
        <View style={styles.footer}>
          <View style={styles.deliveryInfo}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.deliveryText}>{store.deliveryTime}</Text>
          </View>
          <Button variant="outline" size="sm" onPress={onPress}>
            Visit Store
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  ratingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#6B7280',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    marginLeft: 4,
    color: '#6B7280',
    fontSize: 14,
  },
}); 