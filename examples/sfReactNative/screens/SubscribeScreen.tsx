/**
 * Level 5: Subscribe Demo
 * Listen to signal changes
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const count = createSignal(0);

export default function SubscribeScreen() {
  const currentCount = useSignalValue(count);
  const [subscriptionLogs, setSubscriptionLogs] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (isSubscribed) {
      unsubscribe = count.subscribe((newValue) => {
        const log = `🔔 Count changed to: ${newValue}`;
        console.log(log);
        setSubscriptionLogs(prev => [...prev, log]);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSubscribed]);

  const toggleSubscription = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      setSubscriptionLogs(prev => [...prev, '✅ Subscription started']);
    } else {
      setSubscriptionLogs(prev => [...prev, '⏹️ Subscription stopped']);
    }
  };

  const incrementCount = () => {
    count.set(count.get() + 1);
  };

  const clearLogs = () => {
    setSubscriptionLogs([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👂 Subscribe to Changes</Text>
        <Text style={styles.description}>
          Subscribe to be notified whenever a signal changes. Perfect for logging, analytics, or triggering external actions!
        </Text>

        <View style={styles.display}>
          <Text style={styles.label}>Current Count:</Text>
          <Text style={styles.value}>{currentCount}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Subscription Status:</Text>
          <View style={[styles.statusBadge, isSubscribed ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={styles.statusText}>
              {isSubscribed ? '🟢 Active (Listening)' : '🔴 Inactive (Not Listening)'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, isSubscribed ? styles.buttonDanger : styles.buttonSuccess]}
            onPress={toggleSubscription}
          >
            <Text style={styles.buttonText}>
              {isSubscribed ? '⏹️ Stop Listening' : '▶️ Start Listening'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={incrementCount}
          >
            <Text style={styles.buttonText}>Increment Count (+1)</Text>
            <Text style={styles.buttonSubtext}>
              {isSubscribed ? 'Will trigger notification' : 'No notification (not subscribed)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>📋 Subscription Logs:</Text>
            <TouchableOpacity onPress={clearLogs}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logContainer}>
            {subscriptionLogs.length === 0 ? (
              <Text style={styles.emptyLog}>
                Start listening and increment to see notifications!
              </Text>
            ) : (
              subscriptionLogs.map((log, index) => (
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
            {`const count = createSignal(0);\n\n// Subscribe to changes\nconst unsubscribe = count.subscribe((newValue) => {\n  console.log('Count changed to:', newValue);\n});\n\n// Change value - subscriber gets notified\ncount.set(1); // Output: "Count changed to: 1"\ncount.set(2); // Output: "Count changed to: 2"\n\n// Stop listening\nunsubscribe();\ncount.set(3); // No output (not listening)`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 When to Use Subscribe</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Track changes for debugging</Text>
          <Text style={styles.bullet}>• Send analytics events</Text>
          <Text style={styles.bullet}>• Sync with external systems</Text>
          <Text style={styles.bullet}>• Log state changes</Text>
          <Text style={styles.bullet}>• Trigger side effects outside React</Text>
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
    marginBottom: 15,
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
  statusCard: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeStatus: {
    backgroundColor: '#d1fae5',
  },
  inactiveStatus: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 16,
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
  buttonSuccess: {
    backgroundColor: '#10b981',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
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
