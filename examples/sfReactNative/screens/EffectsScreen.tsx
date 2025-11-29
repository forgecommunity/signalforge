/**
 * Level 3: Effects Demo
 * Run code automatically when signals change
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createEffect } from 'signalforge-alpha';
import { useSignalValue } from 'signalforge-alpha/react';

// Create signal
const userName = createSignal('John');
const messageCount = createSignal(0);

export default function EffectsScreen() {
  const currentUserName = useSignalValue(userName);
  const currentMessageCount = useSignalValue(messageCount);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Create effect that logs when userName changes
    const cleanup1 = createEffect(() => {
      const name = userName.get();
      const log = `👋 Hello, ${name}!`;
      console.log(log);
      setLogs(prev => [...prev, log]);
    });

    // Create effect that tracks message count
    const cleanup2 = createEffect(() => {
      const count = messageCount.get();
      const log = `📬 You have ${count} message${count !== 1 ? 's' : ''}`;
      console.log(log);
      setLogs(prev => [...prev, log]);
    });

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  const changeName = (name: string) => {
    userName.set(name);
  };

  const addMessage = () => {
    messageCount.set(messageCount.get() + 1);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Effects</Text>
        <Text style={styles.description}>
          Effects run automatically when signals they depend on change. Perfect for logging, saving data, or triggering side effects!
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change User Name:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => changeName('John')}
            >
              <Text style={styles.buttonText}>John</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => changeName('Jane')}
            >
              <Text style={styles.buttonText}>Jane</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => changeName('Bob')}
            >
              <Text style={styles.buttonText}>Bob</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Count:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={addMessage}
            >
              <Text style={styles.buttonText}>Add Message (+1)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={() => messageCount.set(0)}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>📝 Effect Logs:</Text>
            <TouchableOpacity onPress={clearLogs}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logContainer}>
            {logs.length === 0 ? (
              <Text style={styles.emptyLog}>No logs yet. Try changing values!</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={styles.logItem}>
                  {index + 1}. {log}
                </Text>
              ))
            )}
          </View>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`const userName = createSignal('John');\n\n// Effect runs when userName changes\nconst cleanup = createEffect(() => {\n  console.log('Hello, ' + userName.get());\n});\n\n// Change name - effect runs!\nuserName.set('Jane');\n// Output: "Hello, Jane!"\n\n// Stop the effect\ncleanup();`}
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
    flex: 1,
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  logSection: {
    marginTop: 20,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clearButton: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  emptyLog: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 5,
    lineHeight: 18,
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
});
