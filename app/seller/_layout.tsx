import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function SellerAppLayout() {
  // We will add the Header, Sidebar and other layout components here later
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
} 