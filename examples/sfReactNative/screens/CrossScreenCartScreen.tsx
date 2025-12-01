/**
 * Cart Screen - Part 3 of Cross-Screen Demo
 * Shows how to read and modify global cart state
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSignalValue } from 'signalforge/react';
import { 
  currentUser,
  cartItems,
  cartTotal,
  cartItemCount,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  completeCheckout,
  userDisplayName
} from '../shared/globalState';

export default function CrossScreenCartScreen() {
  const user = useSignalValue(currentUser);
  const displayName = useSignalValue(userDisplayName);
  const items = useSignalValue(cartItems);
  const total = useSignalValue(cartTotal);
  const itemCount = useSignalValue(cartItemCount);

  const handleCheckout = () => {
    const result = completeCheckout();
    
    Alert.alert(
      result.success ? 'Success!' : 'Error',
      result.message,
      [{ text: 'OK' }]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearCart()
        }
      ]
    );
  };

  const increaseQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateCartItemQuantity(itemId, item.quantity + 1);
    }
  };

  const decreaseQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateCartItemQuantity(itemId, item.quantity - 1);
    }
  };

  if (items.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shopping Cart</Text>
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartEmoji}>🛒</Text>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>
              Go to the Store screen to add items
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This cart displays items from a global signal that's shared across all screens. 
              When you add items in the Store screen, they appear here instantly!
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const canCheckout = user.points >= total;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{displayName}'s Cart</Text>
          <Text style={styles.headerSubtitle}>{itemCount} items</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{user.points}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cart Items</Text>
        
        {items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {item.price} pts × {item.quantity} = {item.price * item.quantity} pts
              </Text>
            </View>
            
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => decreaseQuantity(item.id)}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => increaseQuantity(item.id)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCart}
        >
          <Text style={styles.clearButtonText}>Clear All Items</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={styles.summaryValue}>{total} pts</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Your Balance</Text>
          <Text style={[styles.summaryValue, { color: user.points >= total ? '#10b981' : '#ef4444' }]}>
            {user.points} pts
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>After Purchase</Text>
          <Text style={styles.totalValue}>
            {Math.max(0, user.points - total)} pts
          </Text>
        </View>

        {!canCheckout && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Not enough points! Need {total - user.points} more points.
              Go to Profile screen to add points.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !canCheckout && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={!canCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            {canCheckout ? 'Complete Order' : 'Insufficient Points'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Updates</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Try this:</Text> Keep this screen open and go to the Profile screen. 
            Add some points there, then come back. The "Your Balance" and checkout button update automatically!
          </Text>
        </View>
        
        <View style={styles.codeBlock}>
          <Text style={styles.code}>
{`// This screen subscribes to signals
const user = useSignalValue(currentUser);
const items = useSignalValue(cartItems);

// When Profile screen does this:
addPoints(50);

// This screen re-renders automatically
// with updated user.points!

// All screens stay in sync 🎯`}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  pointsBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#e0e7ff',
    marginBottom: 2,
  },
  pointsValue: {
    fontSize: 18,
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
    marginBottom: 15,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  cartItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  qtyButton: {
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    marginTop: 15,
  },
  warningText: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
  checkoutButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
