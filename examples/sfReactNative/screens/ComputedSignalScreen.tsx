/**
 * Level 2: Computed Signal Demo
 * Auto-calculating signals
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { createSignal, createComputed } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

// Create base signals
const price = createSignal(100);
const quantity = createSignal(2);

// Create computed signal (auto-calculates!)
const total = createComputed(() => {
  return price.get() * quantity.get();
});

export default function ComputedSignalScreen() {
  const currentPrice = useSignalValue(price);
  const currentQuantity = useSignalValue(quantity);
  const currentTotal = useSignalValue(total);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧮 Computed Signal</Text>
        <Text style={styles.description}>
          A computed signal automatically recalculates when its dependencies change. No manual updates needed!
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price ($):</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => price.set(Math.max(0, currentPrice - 10))}
            >
              <Text style={styles.smallButtonText}>-10</Text>
            </TouchableOpacity>
            <Text style={styles.inputValue}>${currentPrice}</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => price.set(currentPrice + 10)}
            >
              <Text style={styles.smallButtonText}>+10</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quantity:</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => quantity.set(Math.max(1, currentQuantity - 1))}
            >
              <Text style={styles.smallButtonText}>-1</Text>
            </TouchableOpacity>
            <Text style={styles.inputValue}>{currentQuantity}</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => quantity.set(currentQuantity + 1)}
            >
              <Text style={styles.smallButtonText}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalDisplay}>
          <Text style={styles.totalLabel}>Total (Auto-calculated):</Text>
          <Text style={styles.totalValue}>${currentTotal}</Text>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`const price = createSignal(100);\nconst quantity = createSignal(2);\n\nconst total = createComputed(() => {\n  return price.get() * quantity.get();\n});\n\n// Change price - total auto-updates!\nprice.set(150);\ntotal.get(); // ${currentTotal} ✨`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Why This is Amazing</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>✅ No manual recalculation needed</Text>
          <Text style={styles.bullet}>✅ Always up-to-date</Text>
          <Text style={styles.bullet}>✅ Automatically tracks dependencies</Text>
          <Text style={styles.bullet}>✅ Super efficient (only updates when needed)</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  smallButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 80,
    textAlign: 'center',
  },
  totalDisplay: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86efac',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#166534',
    marginBottom: 5,
  },
  totalValue: {
    fontSize: 42,
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
    fontSize: 12,
    color: '#e5e7eb',
    lineHeight: 18,
  },
  bulletList: {
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#16a34a',
    lineHeight: 20,
    fontWeight: '500',
  },
});
