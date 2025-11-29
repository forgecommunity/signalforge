/**
 * Level 1: Basic Signal Demo
 * Create, read, and update signals
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal } from 'signalforge-alpha';
import { useSignalValue } from 'signalforge-alpha/react';

// Create a signal (like a smart variable)
const age = createSignal(25);

export default function BasicSignalScreen() {
  const currentAge = useSignalValue(age);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Basic Signal</Text>
        <Text style={styles.description}>
          A signal is like a smart variable that holds a value and notifies when it changes.
        </Text>

        <View style={styles.display}>
          <Text style={styles.label}>Current Age:</Text>
          <Text style={styles.value}>{currentAge}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => age.set(age.get() + 1)}
          >
            <Text style={styles.buttonText}>Increment (+1)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => age.set(age.get() - 1)}
          >
            <Text style={styles.buttonText}>Decrement (-1)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={() => age.set(25)}
          >
            <Text style={styles.buttonText}>Reset to 25</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`const age = createSignal(25);\n\n// Read the value\nage.get(); // ${currentAge}\n\n// Set the value\nage.set(26);\n\n// Update based on current\nage.set(current => current + 1);`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Key Concepts</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• <Text style={styles.bold}>createSignal()</Text> - Creates a new signal</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>.get()</Text> - Reads the current value</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>.set()</Text> - Updates the value</Text>
          <Text style={styles.bullet}>• <Text style={styles.bold}>useSignalValue()</Text> - Subscribe in React</Text>
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
  display: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 5,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  buttonGroup: {
    gap: 10,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#4b5563',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#1f2937',
  },
});
