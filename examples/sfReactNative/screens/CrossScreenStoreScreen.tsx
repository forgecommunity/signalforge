/**
 * Store Screen - Part 2 of Cross-Screen Demo
 * Shows how to add items to global cart state
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSignalValue } from 'signalforge/react';
import { 
  currentUser, 
  cartItems,
  cartItemCount,
  cartTotal,
  addToCart,
  userDisplayName
} from '../shared/globalState';

const PRODUCTS = [
  { id: 'laptop', name: 'Laptop Pro', price: 120, emoji: '💻' },
  { id: 'phone', name: 'Smartphone', price: 80, emoji: '📱' },
  { id: 'tablet', name: 'Tablet', price: 60, emoji: '📓' },
  { id: 'watch', name: 'Smart Watch', price: 40, emoji: '⌚' },
  { id: 'headphones', name: 'Headphones', price: 30, emoji: '🎧' },
  { id: 'keyboard', name: 'Keyboard', price: 25, emoji: '⌨️' },
  { id: 'mouse', name: 'Mouse', price: 15, emoji: '🖱️' },
  { id: 'monitor', name: 'Monitor', price: 150, emoji: '🖥️' },
];

export default function CrossScreenStoreScreen() {
  const user = useSignalValue(currentUser);
  const displayName = useSignalValue(userDisplayName);
  const items = useSignalValue(cartItems);
  const itemCount = useSignalValue(cartItemCount);
  const total = useSignalValue(cartTotal);

  const handleAddToCart = (product: typeof PRODUCTS[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
    });
    
    Alert.alert(
      'Added to Cart',
      `${product.name} added to your cart!`,
      [{ text: 'OK' }]
    );
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Text style={styles.welcomeText}>Welcome, {displayName}!</Text>
          <Text style={styles.pointsText}>Points: {user.points}</Text>
        </View>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount} items</Text>
          <Text style={styles.cartTotal}>{total} pts</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Product Store</Text>
        <Text style={styles.description}>
          Add items to cart. Watch the Profile and Cart screens update automatically!
        </Text>

        {PRODUCTS.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productEmoji}>{product.emoji}</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price} points</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                isInCart(product.id) && styles.addButtonAdded
              ]}
              onPress={() => handleAddToCart(product)}
            >
              <Text style={styles.addButtonText}>
                {isInCart(product.id) ? 'Add More' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cross-Screen Communication</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Try this:</Text> Add items here, then switch to the Cart or Profile screens. 
            You'll see the cart count and total update instantly without any navigation props or callbacks!
          </Text>
        </View>
        
        <View style={styles.codeBlock}>
          <Text style={styles.code}>
{`// Adding to cart updates all screens
addToCart({
  id: 'laptop',
  name: 'Laptop Pro',
  price: 120
});

// Profile screen sees it instantly
const itemCount = useSignalValue(cartItemCount);

// Cart screen sees it too
const items = useSignalValue(cartItems);

// All automatic, no prop drilling!`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  cartBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    color: '#e0e7ff',
    marginBottom: 2,
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonAdded: {
    backgroundColor: '#6366f1',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 8,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#e5e7eb',
    lineHeight: 18,
  },
});
