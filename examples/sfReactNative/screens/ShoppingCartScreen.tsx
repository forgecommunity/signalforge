/**
 * Example: Shopping Cart
 * Real-world example with computed signals
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createComputed } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const items = createSignal<CartItem[]>([
  { id: 1, name: '🍎 Apple', price: 1.5, qty: 2 },
  { id: 2, name: '🍞 Bread', price: 2.0, qty: 1 },
  { id: 3, name: '🥛 Milk', price: 3.0, qty: 1 },
]);

const subtotal = createComputed(() => {
  return items.get().reduce((sum, item) => sum + (item.price * item.qty), 0);
});

const tax = createComputed(() => subtotal.get() * 0.1); // 10% tax

const total = createComputed(() => subtotal.get() + tax.get());

const itemCount = createComputed(() => {
  return items.get().reduce((sum, item) => sum + item.qty, 0);
});

export default function ShoppingCartScreen() {
  const currentItems = useSignalValue(items);
  const currentSubtotal = useSignalValue(subtotal);
  const currentTax = useSignalValue(tax);
  const currentTotal = useSignalValue(total);
  const currentItemCount = useSignalValue(itemCount);

  const increaseQty = (id: number) => {
    items.set(current =>
      current.map(item =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id: number) => {
    items.set(current =>
      current.map(item =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    items.set(current => current.filter(item => item.id !== id));
  };

  const addNewItem = () => {
    const newId = Math.max(...currentItems.map(i => i.id)) + 1;
    const products = [
      { name: '🍌 Banana', price: 0.75 },
      { name: '🥚 Eggs', price: 4.0 },
      { name: '🧀 Cheese', price: 5.5 },
      { name: '🍊 Orange', price: 1.25 },
    ];
    const product = products[Math.floor(Math.random() * products.length)];
    items.set(current => [...current, { id: newId, ...product, qty: 1 }]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛒 Shopping Cart</Text>
        <Text style={styles.description}>
          Real-world example: Cart automatically recalculates subtotal, tax, and total!
        </Text>

        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{currentItemCount} items in cart</Text>
        </View>

        {currentItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => decreaseQty(item.id)}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => increaseQty(item.id)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.itemTotal}>
              <Text style={styles.itemTotalText}>
                ${(item.price * item.qty).toFixed(2)}
              </Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.removeButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
          <Text style={styles.addButtonText}>+ Add Random Item</Text>
        </TouchableOpacity>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${currentSubtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (10%):</Text>
            <Text style={styles.totalValue}>${currentTax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalLabel}>Total:</Text>
            <Text style={styles.finalValue}>${currentTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Auto-Calculation Code:</Text>
          <Text style={styles.code}>
            {`const items = createSignal([...]);\n\nconst subtotal = createComputed(() => {\n  return items.get().reduce(\n    (sum, item) => sum + item.price * item.qty,\n    0\n  );\n});\n\nconst tax = createComputed(\n  () => subtotal.get() * 0.1\n);\n\nconst total = createComputed(\n  () => subtotal.get() + tax.get()\n);\n\n// Change items - everything updates! ✨`}
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
  itemCountBadge: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#6b7280',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  qtyButton: {
    backgroundColor: '#6366f1',
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 12,
    minWidth: 25,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 5,
  },
  removeButton: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalsCard: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#166534',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  finalTotal: {
    borderTopWidth: 2,
    borderTopColor: '#86efac',
    paddingTop: 10,
    marginTop: 5,
    marginBottom: 0,
  },
  finalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
  },
  finalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  codeTitle: {
    fontSize: 14,
    color: '#fbbf24',
    marginBottom: 10,
    fontWeight: '600',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#e5e7eb',
    lineHeight: 15,
  },
});
