import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useHeader } from '../../../lib/header-context';
import { theme } from '../../../lib/theme';
import { Card } from '../../components/ui/card';
import { SafeAreaView } from '../../components/ui/safe-area-view';
import { Text } from '../../components/ui/text';

const categories = [
  { name: "Groceries", icon: "🥑", id: "groceries", description: "Essential food items" },
  { name: "Vegetables", icon: "🥕", id: "vegetables", description: "Fresh vegetables" },
  { name: "Fruits", icon: "🍎", id: "fruits", description: "Fresh seasonal fruits" },
  { name: "Dairy", icon: "🥛", id: "dairy", description: "Milk & dairy products" },
  { name: "Snacks", icon: "🍪", id: "snacks", description: "Chips, cookies & more" },
  { name: "Beverages", icon: "🥤", id: "beverages", description: "Drinks & refreshments" },
  { name: "Personal Care", icon: "🧴", id: "personal-care", description: "Health & beauty products" },
  { name: "Household", icon: "🏠", id: "household", description: "Cleaning & home essentials" },
  { name: "Baby Care", icon: "👶", id: "baby-care", description: "Baby products & formula" },
  { name: "Pet Care", icon: "🐕", id: "pet-care", description: "Pet food & accessories" },
  { name: "Bakery", icon: "🥖", id: "bakery", description: "Fresh bread & baked goods" },
  { name: "Frozen Foods", icon: "🧊", id: "frozen", description: "Frozen items & ice cream" },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();

  useEffect(() => {
    setTitle('All Categories');
    
    return () => {
      setTitle(null);
    };
  }, [setTitle]);

  const handleCategoryPress = (category: { name: string; id: string }) => {
    console.log('Category pressed:', category.name);
    router.push({
      pathname: '/category/[categoryName]' as any,
      params: { categoryName: category.name }
    });
  };

  const renderCategory = ({ item: category, index }: { item: typeof categories[0], index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.categoryWrapper}
    >
      <TouchableOpacity
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <Card style={styles.categoryCard}>
          <View style={styles.categoryContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Shop by Category</Text>
          <Text style={styles.pageSubtitle}>
            Browse {categories.length} categories to find what you need
          </Text>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  pageSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  listContainer: {
    paddingBottom: theme.spacing.lg,
  },
  categoryWrapper: {
    marginBottom: theme.spacing.md,
  },
  categoryCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  categoryDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    lineHeight: 18,
  },
  arrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: theme.colors.gray[400],
    fontWeight: '500',
  },
}); 