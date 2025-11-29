/**
 * Level 7: React Hooks Demo
 * useSignal, useSignalValue, useSignalEffect
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal } from 'signalforge-alpha';
import { useSignal, useSignalValue, useSignalEffect } from 'signalforge-alpha/react';

// Global signal
const globalCounter = createSignal(0);

function ComponentStateExample() {
  // useSignal - like useState but with signals!
  const [count, setCount] = useSignal(0);

  return (
    <View style={styles.exampleCard}>
      <Text style={styles.exampleTitle}>📦 Component State (useSignal)</Text>
      <Text style={styles.exampleDesc}>Like useState but more powerful!</Text>
      <View style={styles.display}>
        <Text style={styles.displayValue}>{count}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.smallButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallButton, styles.buttonSecondary]}
          onPress={() => setCount(0)}
        >
          <Text style={styles.smallButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
          {`const [count, setCount] = useSignal(0);`}
        </Text>
      </View>
    </View>
  );
}

function GlobalStateExample() {
  // useSignalValue - subscribe to global signal
  const count = useSignalValue(globalCounter);

  return (
    <View style={styles.exampleCard}>
      <Text style={styles.exampleTitle}>🌍 Global State (useSignalValue)</Text>
      <Text style={styles.exampleDesc}>Subscribe to external signals</Text>
      <View style={styles.display}>
        <Text style={styles.displayValue}>{count}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => globalCounter.set(globalCounter.get() + 1)}
        >
          <Text style={styles.smallButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallButton, styles.buttonSecondary]}
          onPress={() => globalCounter.set(0)}
        >
          <Text style={styles.smallButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
          {`const globalCount = createSignal(0);\nconst count = useSignalValue(globalCount);`}
        </Text>
      </View>
    </View>
  );
}

function EffectExample() {
  const [trigger, setTrigger] = useSignal(0);
  const [log, setLog] = React.useState<string[]>([]);

  // useSignalEffect - auto-tracking effect
  useSignalEffect(() => {
    const value = trigger;
    const message = `Effect ran! Trigger = ${value}`;
    console.log(message);
    setLog(prev => [...prev, message].slice(-3));
  });

  return (
    <View style={styles.exampleCard}>
      <Text style={styles.exampleTitle}>⚡ Auto-Tracking Effect (useSignalEffect)</Text>
      <Text style={styles.exampleDesc}>Effect automatically tracks signal dependencies</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setTrigger(trigger + 1)}
      >
        <Text style={styles.buttonText}>Trigger Effect (Current: {trigger})</Text>
      </TouchableOpacity>
      <View style={styles.logBox}>
        {log.map((item, index) => (
          <Text key={index} style={styles.logText}>• {item}</Text>
        ))}
      </View>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
          {`useSignalEffect(() => {\n  // Auto-tracks trigger\n  console.log(trigger);\n});`}
        </Text>
      </View>
    </View>
  );
}

export default function ReactHooksScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚛️ React Hooks</Text>
        <Text style={styles.headerDesc}>
          Three powerful hooks for integrating SignalForge with React
        </Text>
      </View>

      <ComponentStateExample />
      <GlobalStateExample />
      <EffectExample />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📚 Summary</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            <Text style={styles.bold}>useSignal</Text> - Component state (like useState)
          </Text>
          <Text style={styles.bullet}>
            <Text style={styles.bold}>useSignalValue</Text> - Subscribe to external signals
          </Text>
          <Text style={styles.bullet}>
            <Text style={styles.bold}>useSignalEffect</Text> - Auto-tracking effects
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
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    marginBottom: 0,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  headerDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  exampleCard: {
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
  exampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  exampleDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 15,
  },
  display: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  displayValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    backgroundColor: '#6366f1',
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    minHeight: 80,
  },
  logText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 3,
  },
  codeBox: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#e5e7eb',
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  bulletList: {
    gap: 10,
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
