/**
 * Array Signal Demo
 * Using createArraySignal helper
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { createArraySignal } from 'signalforge/utils';
import { useSignalValue } from 'signalforge/react';

const fruits = createArraySignal(['🍎 Apple', '🍌 Banana', '🍊 Orange']);

export default function ArraySignalScreen() {
  const currentFruits = useSignalValue(fruits);
  const [newFruit, setNewFruit] = React.useState('');

  const addFruit = () => {
    if (newFruit.trim()) {
      fruits.push(newFruit);
      setNewFruit('');
    }
  };

  const removeLast = () => {
    fruits.pop();
  };

  const removeFruit = (item: string) => {
    fruits.remove(item);
  };

  const clearAll = () => {
    fruits.clear();
  };

  const filterLong = () => {
    fruits.filter((item) => item.length <= 10);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Array Signal</Text>
        <Text style={styles.description}>
          Special signal with built-in array methods like push, pop, filter, map, and more!
        </Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Array Length: {fruits.length}</Text>
          <Text style={styles.statsText}>Items: {currentFruits.length}</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add fruit (e.g., 🍇 Grape)"
            value={newFruit}
            onChangeText={setNewFruit}
            onSubmitEditing={addFruit}
          />
          <TouchableOpacity style={styles.addButton} onPress={addFruit}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => fruits.push('🍓 Strawberry')}
          >
            <Text style={styles.buttonText}>Push 🍓</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={removeLast}
            disabled={currentFruits.length === 0}
          >
            <Text style={styles.buttonText}>Pop Last</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonInfo]}
            onPress={filterLong}
          >
            <Text style={styles.buttonText}>Filter Short</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={clearAll}
          >
            <Text style={styles.buttonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>🍎 Fruits List:</Text>
          {currentFruits.length === 0 ? (
            <Text style={styles.emptyText}>No fruits! Add some above.</Text>
          ) : (
            currentFruits.map((fruit, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>
                  {index + 1}. {fruit}
                </Text>
                <TouchableOpacity onPress={() => removeFruit(fruit)}>
                  <Text style={styles.removeButton}>❌</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`const fruits = createArraySignal(['Apple']);\n\n// Array methods\nfruits.push('Banana');  // Add\nfruits.pop();           // Remove last\nfruits.remove('Apple'); // Remove specific\nfruits.clear();         // Clear all\n\n// Array properties\nfruits.length;          // ${fruits.length}\nfruits.get();           // Get full array\n\n// Filter\nfruits.filter((item, i) => i !== 0);\n\n// Map (returns new signal)\nconst upper = fruits.map(f => f.toUpperCase());`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔧 Available Methods</Text>
        <View style={styles.methodList}>
          <Text style={styles.method}>• <Text style={styles.bold}>push(item)</Text> - Add to end</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>pop()</Text> - Remove last</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>filter(fn)</Text> - Filter items</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>map(fn)</Text> - Transform items</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>find(fn)</Text> - Find item</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>remove(item)</Text> - Remove specific</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>clear()</Text> - Remove all</Text>
          <Text style={styles.method}>• <Text style={styles.bold}>length</Text> - Array length</Text>
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
  statsCard: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#15803d',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
  },
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
  },
  buttonInfo: {
    backgroundColor: '#06b6d4',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 6,
  },
  listItemText: {
    fontSize: 14,
    color: '#1f2937',
  },
  removeButton: {
    fontSize: 16,
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
  methodList: {
    gap: 8,
  },
  method: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#1f2937',
  },
});
