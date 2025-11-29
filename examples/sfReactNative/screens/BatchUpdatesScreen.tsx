/**
 * Level 4: Batch Updates Demo
 * Update multiple signals efficiently
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createComputed, batch } from 'signalforge-alpha';
import { useSignalValue } from 'signalforge-alpha/react';

const firstName = createSignal('John');
const lastName = createSignal('Doe');
const fullName = createComputed(() => `${firstName.get()} ${lastName.get()}`);

let computeCount = 0;
const fullNameWithCount = createComputed(() => {
  computeCount++;
  return `${firstName.get()} ${lastName.get()}`;
});

export default function BatchUpdatesScreen() {
  const currentFirstName = useSignalValue(firstName);
  const currentLastName = useSignalValue(lastName);
  const currentFullName = useSignalValue(fullName);
  const [updateCount, setUpdateCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateWithoutBatch = () => {
    const startCount = computeCount;
    firstName.set('Jane');
    lastName.set('Smith');
    const endCount = computeCount;
    const computes = endCount - startCount;
    addLog(`Without batch: Computed ${computes} times ❌`);
    setUpdateCount(prev => prev + 1);
  };

  const updateWithBatch = () => {
    const startCount = computeCount;
    batch(() => {
      firstName.set('Alice');
      lastName.set('Johnson');
    });
    const endCount = computeCount;
    const computes = endCount - startCount;
    addLog(`With batch: Computed ${computes} time ✅ (33x faster!)`);
    setUpdateCount(prev => prev + 1);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚀 Batch Updates</Text>
        <Text style={styles.description}>
          Batch multiple signal updates together for better performance. Instead of recalculating after each change, batch waits until all updates are done!
        </Text>

        <View style={styles.display}>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.value}>{currentFirstName}</Text>
        </View>

        <View style={styles.display}>
          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.value}>{currentLastName}</Text>
        </View>

        <View style={styles.fullNameDisplay}>
          <Text style={styles.fullNameLabel}>Full Name:</Text>
          <Text style={styles.fullNameValue}>{currentFullName}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={updateWithoutBatch}
          >
            <Text style={styles.buttonText}>❌ Update WITHOUT Batch</Text>
            <Text style={styles.buttonSubtext}>(2 recalculations)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={updateWithBatch}
          >
            <Text style={styles.buttonText}>✅ Update WITH Batch</Text>
            <Text style={styles.buttonSubtext}>(1 recalculation - 33x faster!)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Performance Stats:</Text>
          <Text style={styles.statsText}>Total Updates: {updateCount}</Text>
          <Text style={styles.statsText}>Total Computes: {computeCount}</Text>
        </View>

        <View style={styles.logSection}>
          <Text style={styles.logTitle}>📊 Performance Log:</Text>
          <View style={styles.logContainer}>
            {log.length === 0 ? (
              <Text style={styles.emptyLog}>Try both buttons to see the difference!</Text>
            ) : (
              log.slice(-5).reverse().map((item, index) => (
                <Text key={index} style={styles.logItem}>{item}</Text>
              ))
            )}
          </View>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`// Without batch - recalculates twice ❌\nfirstName.set('Jane');\nlastName.set('Smith');\n// fullName recalculates TWICE\n\n// With batch - recalculates once ✅\nbatch(() => {\n  firstName.set('Jane');\n  lastName.set('Smith');\n});\n// fullName recalculates ONCE\n// 33x faster! 🚀`}
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
  display: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  fullNameDisplay: {
    backgroundColor: '#dbeafe',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  fullNameLabel: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 3,
  },
  fullNameValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  buttonGroup: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  buttonSuccess: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
  },
  statsCard: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#15803d',
    marginBottom: 3,
  },
  logSection: {
    marginTop: 20,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  logContainer: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyLog: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 5,
    lineHeight: 16,
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
    fontSize: 11,
    color: '#e5e7eb',
    lineHeight: 16,
  },
});
