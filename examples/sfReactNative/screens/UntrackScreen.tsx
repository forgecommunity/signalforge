/**
 * Level 6: Untrack Demo
 * Read signals without creating dependencies
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createComputed, untrack } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const count = createSignal(1);
const debugMode = createSignal(true);

let computeCount = 0;
const doubled = createComputed(() => {
  computeCount++;
  const value = count.get() * 2;
  
  // Read debugMode WITHOUT creating dependency
  if (untrack(() => debugMode.get())) {
    console.log('Debug:', value);
  }
  
  return value;
});

export default function UntrackScreen() {
  const currentCount = useSignalValue(count);
  const currentDebugMode = useSignalValue(debugMode);
  const currentDoubled = useSignalValue(doubled);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const changeCount = () => {
    count.set(count.get() + 1);
    addLog(`✅ Count changed to ${count.get()} → Computed recalculated (${computeCount} total)`);
  };

  const toggleDebug = () => {
    debugMode.set(!debugMode.get());
    addLog(`🔧 Debug mode: ${!currentDebugMode} → Computed NOT recalculated (untracked!)`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔓 Untrack</Text>
        <Text style={styles.description}>
          Read a signal WITHOUT creating a dependency. The computed won't recalculate when untracked signals change!
        </Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Current Values:</Text>
          <Text style={styles.statsText}>Count: {currentCount}</Text>
          <Text style={styles.statsText}>Doubled: {currentDoubled}</Text>
          <Text style={styles.statsText}>Debug Mode: {currentDebugMode ? 'ON' : 'OFF'}</Text>
          <Text style={styles.statsText}>Total Computes: {computeCount}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🎯 How It Works:</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>count</Text> is tracked → changes trigger recompute
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>debugMode</Text> is untracked → changes DON'T trigger recompute
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={changeCount}
          >
            <Text style={styles.buttonText}>Change Count (+1)</Text>
            <Text style={styles.buttonSubtext}>✅ Will trigger recompute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={toggleDebug}
          >
            <Text style={styles.buttonText}>Toggle Debug Mode</Text>
            <Text style={styles.buttonSubtext}>❌ Will NOT trigger recompute</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logSection}>
          <Text style={styles.logTitle}>📝 Activity Log:</Text>
          <View style={styles.logContainer}>
            {logs.length === 0 ? (
              <Text style={styles.emptyLog}>Try both buttons to see the difference!</Text>
            ) : (
              logs.slice(-6).reverse().map((log, index) => (
                <Text key={index} style={styles.logItem}>{log}</Text>
              ))
            )}
          </View>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`const count = createSignal(1);\nconst debugMode = createSignal(true);\n\nconst doubled = createComputed(() => {\n  const value = count.get() * 2;\n  \n  // Read WITHOUT creating dependency\n  if (untrack(() => debugMode.get())) {\n    console.log('Debug:', value);\n  }\n  \n  return value;\n});\n\n// Changing count triggers recompute ✅\ncount.set(5);\n\n// Changing debugMode does NOT ❌\ndebugMode.set(false);`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 When to Use Untrack</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Read config/settings without dependency</Text>
          <Text style={styles.bullet}>• Access debug flags</Text>
          <Text style={styles.bullet}>• Prevent unnecessary recalculations</Text>
          <Text style={styles.bullet}>• Break circular dependencies</Text>
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
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
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
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
    marginBottom: 5,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
  },
  buttonGroup: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
  },
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 3,
    opacity: 0.9,
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
  bulletList: {
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
