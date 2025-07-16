import React, { useRef } from 'react';
import {
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { StoreCard } from '../dashboard/StoreCard';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.min(280, screenWidth * 0.80); // Reduced from 0.8 to 0.65 and capped at 280
const CARD_SPACING = 16; // Increased from 8 for better spacing

interface AnimatedStoreCardProps {
  store: any;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}

const AnimatedStoreCard: React.FC<AnimatedStoreCardProps> = ({
  store,
  index,
  scrollX,
  onPress,
}) => {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_SPACING),
    index * (CARD_WIDTH + CARD_SPACING),
    (index + 1) * (CARD_WIDTH + CARD_SPACING),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[{ width: CARD_WIDTH }, animatedStyle]}>
      <StoreCard
        store={{
          ...store,
          description: store.storeAddress || 'No address provided',
          imageUrl:
            store.storeImgUrl ||
            'https://images.unsplash.com/photo-1584008604?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          deliveryTime: '30-45 min',
          categories: store.categories || [],
        }}
        onPress={onPress}
      />
    </Animated.View>
  );
};

interface DotIndicatorProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
  onDotPress: (index: number) => void;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({
  data,
  scrollX,
  onDotPress,
}) => {
  return (
    <View style={styles.dotContainer}>
      {data.map((_, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1.4, 0.8],
            Extrapolate.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.4, 1, 0.4],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ scale }],
            opacity,
          };
        });

        return (
          <TouchableOpacity key={index} onPress={() => onDotPress(index)}>
            <Animated.View style={[styles.dot, animatedStyle]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface AnimatedStoreCarouselProps {
  stores: any[];
  onStorePress: (storeId: string) => void;
}

export const AnimatedStoreCarousel: React.FC<AnimatedStoreCarouselProps> = ({
  stores,
  onStorePress,
}) => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const snapOffsets = stores.map(
    (_, index) => index * (CARD_WIDTH + CARD_SPACING)
  );

  const handleDotPress = (index: number) => {
    if (scrollViewRef.current) {
      const offset = snapOffsets[index];
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToOffsets={snapOffsets}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
      >
        {stores.map((store: any, index: number) => (
          <View
            key={store._id}
            style={[
              styles.animatedCard,
              // No special styling for last card needed with this setup
            ]}
          >
            <AnimatedStoreCard
              store={store}
              index={index}
              scrollX={scrollX}
              onPress={() => onStorePress(store._id)}
            />
          </View>
        ))}
      </ScrollView>

      {stores.length > 1 && (
        <DotIndicator
          data={stores}
          scrollX={scrollX}
          onDotPress={handleDotPress}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20, // Better fixed padding instead of formula
    paddingVertical: 8, // Increased vertical padding
  },
  animatedCard: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    marginVertical: 4, // Added vertical margin for cards
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16, // Increased from 8
    paddingVertical: 8, // Increased padding
    paddingHorizontal: 16, // Added horizontal padding
  },
  dot: {
    width: 8, // Increased back to 8
    height: 8, // Increased back to 8
    borderRadius: 4, // Increased back to 4
    backgroundColor: '#4F46E5',
    marginHorizontal: 4, // Increased from 3
  },
}); 