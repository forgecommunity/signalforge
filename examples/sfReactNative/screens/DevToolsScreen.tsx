/**
 * DevTools Demo
 * Signal monitoring and debugging
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createComputed, createEffect } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';

// Create signals for monitoring
const debugCounter = createSignal(0);
const debugText = createSignal('Hello');
const debugComputed = createComputed(() => `${debugText.get()} - Count: ${debugCounter.get()}`);

// DevTools monitor
class SignalMonitor {
  private listeners: Array<(event: MonitorEvent) => void> = [];
  private events: MonitorEvent[] = [];

  subscribe(callback: (event: MonitorEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  log(type: string, name: string, value: any, oldValue?: any) {
    const event: MonitorEvent = {
      type,
      name,
      value,
      oldValue,
      timestamp: Date.now(),
    };
    this.events.push(event);
    if (this.events.length > 100) {
      this.events.shift();
    }
    this.listeners.forEach(listener => listener(event));
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}

interface MonitorEvent {
  type: string;
  name: string;
  value: any;
  oldValue?: any;
  timestamp: number;
}

const monitor = new SignalMonitor();

function DevToolsScreen() {
  const counterValue = useSignalValue(debugCounter);
  const textValue = useSignalValue(debugText);
  const computedValue = useSignalValue(debugComputed);
  const [events, setEvents] = useState<MonitorEvent[]>([]);
  const [stats, setStats] = useState({ reads: 0, writes: 0, computes: 0 });

  useEffect(() => {
    monitor.log('init', 'DevTools', 'Started', undefined);
    
    const unsubscribe = monitor.subscribe((event) => {
      setEvents(prev => [...prev].slice(-20));
      
      setStats(prev => ({
        reads: event.type === 'read' ? prev.reads + 1 : prev.reads,
        writes: event.type === 'write' ? prev.writes + 1 : prev.writes,
        computes: event.type === 'compute' ? prev.computes + 1 : prev.computes,
      }));
    });

    // Monitor effect
    const cleanup = createEffect(() => {
      const count = debugCounter.get();
      const text = debugText.get();
      monitor.log('effect', 'auto-effect', `count=${count}, text=${text}`, undefined);
    });

    return () => {
      unsubscribe();
      cleanup();
    };
  }, []);

  const handleCounterChange = (delta: number) => {
    const oldValue = debugCounter.get();
    const newValue = oldValue + delta;
    debugCounter.set(newValue);
    monitor.log('write', 'debugCounter', newValue, oldValue);
  };

  const handleTextChange = (newText: string) => {
    const oldValue = debugText.get();
    debugText.set(newText);
    monitor.log('write', 'debugText', newText, oldValue);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛠️ DevTools</Text>
      <Text style={styles.subtitle}>Monitor and debug your signals in real-time</Text>

      {/* Stats Dashboard */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Signal Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.writes}</Text>
            <Text style={styles.statLabel}>✍️ Writes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.reads}</Text>
            <Text style={styles.statLabel}>👁️ Reads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.computes}</Text>
            <Text style={styles.statLabel}>⚡ Computes</Text>
          </View>
        </View>
      </View>

      {/* Signal Controls */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎛️ Signal Controls</Text>
        
        <Text style={styles.label}>Counter Signal:</Text>
        <View style={styles.display}>
          <Text style={styles.displayValue}>{counterValue}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => handleCounterChange(-1)}
          >
            <Text style={styles.buttonText}>-1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => handleCounterChange(1)}
          >
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => handleCounterChange(5)}
          >
            <Text style={styles.buttonText}>+5</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Text Signal:</Text>
        <View style={styles.display}>
          <Text style={styles.displayText}>{textValue}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => handleTextChange('Hello')}
          >
            <Text style={styles.buttonText}>Hello</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => handleTextChange('World')}
          >
            <Text style={styles.buttonText}>World</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => handleTextChange('SignalForge')}
          >
            <Text style={styles.buttonText}>SF</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Computed Signal:</Text>
        <View style={[styles.display, styles.displayComputed]}>
          <Text style={styles.displayText}>{computedValue}</Text>
        </View>
        <Text style={styles.hint}>⚡ Auto-updates when dependencies change</Text>
      </View>

      {/* Signal Inspector */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔍 Signal Inspector</Text>
        <View style={styles.inspector}>
          <View style={styles.inspectorRow}>
            <Text style={styles.inspectorLabel}>debugCounter:</Text>
            <Text style={styles.inspectorValue}>{JSON.stringify(counterValue)}</Text>
          </View>
          <View style={styles.inspectorRow}>
            <Text style={styles.inspectorLabel}>debugText:</Text>
            <Text style={styles.inspectorValue}>"{textValue}"</Text>
          </View>
          <View style={styles.inspectorRow}>
            <Text style={styles.inspectorLabel}>debugComputed:</Text>
            <Text style={styles.inspectorValue}>"{computedValue}"</Text>
          </View>
        </View>
      </View>

      {/* Event Log */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Event Log</Text>
        <View style={styles.logHeader}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              monitor.clear();
              setEvents([]);
              setStats({ reads: 0, writes: 0, computes: 0 });
            }}
          >
            <Text style={styles.buttonText}>Clear Log</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logContainer}>
          {monitor.getEvents().length === 0 ? (
            <Text style={styles.logEmpty}>No events logged yet</Text>
          ) : (
            monitor.getEvents().slice(-15).reverse().map((event, index) => (
              <View key={index} style={styles.logEvent}>
                <Text style={styles.logTime}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.logType}>[{event.type}]</Text>
                <Text style={styles.logName}>{event.name}:</Text>
                <Text style={styles.logValue}>{JSON.stringify(event.value)}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Performance Monitor */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Performance Monitor</Text>
        <View style={styles.perfBar}>
          <Text style={styles.perfLabel}>Signal Updates:</Text>
          <View style={styles.perfBarContainer}>
            <View style={[styles.perfBarFill, { width: `${Math.min((stats.writes / 20) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.perfValue}>{stats.writes}</Text>
        </View>
        <View style={styles.perfBar}>
          <Text style={styles.perfLabel}>Computed Runs:</Text>
          <View style={styles.perfBarContainer}>
            <View style={[styles.perfBarFill, { width: `${Math.min((stats.computes / 20) * 100, 100)}%`, backgroundColor: '#2ecc71' }]} />
          </View>
          <Text style={styles.perfValue}>{stats.computes}</Text>
        </View>
        <Text style={styles.hint}>💡 Lower is better - shows minimal re-computation</Text>
      </View>

      {/* DevTools Features */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 DevTools Features</Text>
        <Text style={styles.feature}>✅ <Text style={styles.bold}>Real-time monitoring</Text> - Track all signal changes</Text>
        <Text style={styles.feature}>✅ <Text style={styles.bold}>Event logging</Text> - See read/write/compute events</Text>
        <Text style={styles.feature}>✅ <Text style={styles.bold}>Performance metrics</Text> - Monitor signal efficiency</Text>
        <Text style={styles.feature}>✅ <Text style={styles.bold}>Signal inspector</Text> - Examine current values</Text>
        <Text style={styles.feature}>✅ <Text style={styles.bold}>Dependency tracking</Text> - Visualize signal relationships</Text>
        <Text style={styles.feature}>✅ <Text style={styles.bold}>Debug tools</Text> - Time travel, breakpoints, etc.</Text>
      </View>

      {/* Code Example */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💻 DevTools Integration</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
{`// Monitor signal changes
const signal = createSignal(0);

// Log all updates
createEffect(() => {
  console.log('Signal:', signal.get());
});

// Performance tracking
const start = performance.now();
signal.set(100);
const time = performance.now() - start;
console.log('Update took:', time, 'ms');`}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
    marginBottom: 8,
  },
  display: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  displayComputed: {
    backgroundColor: '#e8f5e9',
  },
  displayValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  displayText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSmall: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  inspector: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
  },
  inspectorRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inspectorLabel: {
    color: '#f39c12',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 8,
  },
  inspectorValue: {
    color: '#ecf0f1',
    fontFamily: 'monospace',
    fontSize: 13,
    flex: 1,
  },
  logHeader: {
    marginBottom: 10,
  },
  logContainer: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    maxHeight: 300,
  },
  logEmpty: {
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logEvent: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  logTime: {
    color: '#95a5a6',
    fontFamily: 'monospace',
    fontSize: 11,
    marginRight: 8,
  },
  logType: {
    color: '#f39c12',
    fontFamily: 'monospace',
    fontSize: 11,
    marginRight: 8,
  },
  logName: {
    color: '#3498db',
    fontFamily: 'monospace',
    fontSize: 11,
    marginRight: 8,
  },
  logValue: {
    color: '#ecf0f1',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  perfBar: {
    marginBottom: 15,
  },
  perfLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  perfBarContainer: {
    height: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  perfBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  perfValue: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  feature: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  codeBox: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
  },
  codeText: {
    color: '#ecf0f1',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default DevToolsScreen;
