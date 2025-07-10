import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function SellerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seller Dashboard</Text>
      <Link href="/" style={styles.link}>Go to Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  }
}); 