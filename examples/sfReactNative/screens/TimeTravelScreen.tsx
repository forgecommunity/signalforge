/**
 * Time Travel Demo
 * Undo/Redo with state history
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';

// Simple time travel implementation for demo
class SimpleTimeTravel<T> {
  private history: T[] = [];
  private future: T[] = [];
  private signal: ReturnType<typeof createSignal<T>>;

  constructor(initialValue: T) {
    this.signal = createSignal(initialValue);
    this.history.push(initialValue);
  }

  get() {
    return this.signal.get();
  }

  set(value: T) {
    this.history.push(value);
    this.future = []; // Clear future when new action happens
    if (this.history.length > 50) {
      this.history.shift(); // Keep max 50 items
    }
    this.signal.set(value);
  }

  undo() {
    if (this.history.length <= 1) return false;
    const current = this.history.pop()!;
    this.future.push(current);
    const previous = this.history[this.history.length - 1];
    this.signal.set(previous);
    return true;
  }

  redo() {
    if (this.future.length === 0) return false;
    const next = this.future.pop()!;
    this.history.push(next);
    this.signal.set(next);
    return true;
  }

  canUndo() {
    return this.history.length > 1;
  }

  canRedo() {
    return this.future.length > 0;
  }

  getHistory() {
    return [...this.history];
  }

  getSignal() {
    return this.signal;
  }

  clear() {
    const current = this.signal.get();
    this.history = [current];
    this.future = [];
  }
}

// Time travel counters
const counter = new SimpleTimeTravel(0);
const textState = new SimpleTimeTravel('Initial state');

function TimeTravelScreen() {
  const counterValue = useSignalValue(counter.getSignal());
  const textValue = useSignalValue(textState.getSignal());
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-10));
  };

  useEffect(() => {
    addLog('Time Travel initialized');
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⏱️ Time Travel</Text>
      <Text style={styles.subtitle}>Undo/Redo state changes like a time machine!</Text>

      {/* Counter Example */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔢 Counter with Time Travel</Text>
        <View style={styles.display}>
          <Text style={styles.displayValue}>{counterValue}</Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              counter.set(counterValue - 1);
              addLog(`Counter decreased to ${counterValue - 1}`);
            }}
          >
            <Text style={styles.buttonText}>-1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              counter.set(counterValue + 1);
              addLog(`Counter increased to ${counterValue + 1}`);
            }}
          >
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              counter.set(counterValue + 10);
              addLog(`Counter jumped to ${counterValue + 10}`);
            }}
          >
            <Text style={styles.buttonText}>+10</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonUndo, !counter.canUndo() && styles.buttonDisabled]}
            onPress={() => {
              if (counter.undo()) {
                addLog(`Undo → Counter: ${counter.get()}`);
              }
            }}
            disabled={!counter.canUndo()}
          >
            <Text style={styles.buttonText}>⏪ Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonRedo, !counter.canRedo() && styles.buttonDisabled]}
            onPress={() => {
              if (counter.redo()) {
                addLog(`Redo → Counter: ${counter.get()}`);
              }
            }}
            disabled={!counter.canRedo()}
          >
            <Text style={styles.buttonText}>⏩ Redo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>📚 History: {counter.getHistory().length} states</Text>
          <Text style={styles.infoText}>
            ⏪ Can Undo: {counter.canUndo() ? '✅' : '❌'}
          </Text>
          <Text style={styles.infoText}>
            ⏩ Can Redo: {counter.canRedo() ? '✅' : '❌'}
          </Text>
        </View>

        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
            {`// Time travel pattern\nconst signal = createSignal(0);\nconst history = [];\n\n// Save state\nhistory.push(signal.get());\n\n// Undo\nconst prev = history.pop();\nsignal.set(prev);`}
          </Text>
        </View>
      </View>

      {/* Text State Example */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Text State with Time Travel</Text>
        <View style={styles.display}>
          <Text style={styles.displayText}>{textValue}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              textState.set('Hello World');
              addLog('Text changed to: Hello World');
            }}
          >
            <Text style={styles.buttonText}>Hello</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              textState.set('React Native');
              addLog('Text changed to: React Native');
            }}
          >
            <Text style={styles.buttonText}>RN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => {
              textState.set('SignalForge');
              addLog('Text changed to: SignalForge');
            }}
          >
            <Text style={styles.buttonText}>SF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonUndo, !textState.canUndo() && styles.buttonDisabled]}
            onPress={() => {
              if (textState.undo()) {
                addLog(`Undo → Text: ${textState.get()}`);
              }
            }}
            disabled={!textState.canUndo()}
          >
            <Text style={styles.buttonText}>⏪ Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonRedo, !textState.canRedo() && styles.buttonDisabled]}
            onPress={() => {
              if (textState.redo()) {
                addLog(`Redo → Text: ${textState.get()}`);
              }
            }}
            disabled={!textState.canRedo()}
          >
            <Text style={styles.buttonText}>⏩ Redo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Counter Timeline</Text>
        <ScrollView horizontal style={styles.timeline}>
          {counter.getHistory().map((value, index) => (
            <View
              key={index}
              style={[
                styles.timelineItem,
                index === counter.getHistory().length - 1 && styles.timelineItemActive
              ]}
            >
              <Text style={styles.timelineValue}>{value}</Text>
              <Text style={styles.timelineIndex}>#{index + 1}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.timelineHint}>← Scroll to see history</Text>
      </View>

      {/* Reset */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Reset History</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={() => {
            counter.clear();
            textState.clear();
            setLogs([]);
            addLog('History cleared and reset');
          }}
        >
          <Text style={styles.buttonText}>Clear All History</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Log */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Activity Log</Text>
        <View style={styles.logContainer}>
          {logs.length === 0 ? (
            <Text style={styles.logEmpty}>No activity yet</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logItem}>
                {log}
              </Text>
            ))
          )}
        </View>
      </View>

      {/* Use Cases */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Real-World Use Cases</Text>
        <Text style={styles.useCase}>🎨 <Text style={styles.bold}>Drawing Apps:</Text> Undo strokes</Text>
        <Text style={styles.useCase}>📝 <Text style={styles.bold}>Text Editors:</Text> Undo/redo edits</Text>
        <Text style={styles.useCase}>🎮 <Text style={styles.bold}>Games:</Text> Replay moves</Text>
        <Text style={styles.useCase}>🛒 <Text style={styles.bold}>Shopping Cart:</Text> Undo item additions</Text>
        <Text style={styles.useCase}>⚙️ <Text style={styles.bold}>Settings:</Text> Revert changes</Text>
        <Text style={styles.useCase}>🐛 <Text style={styles.bold}>Debugging:</Text> Step through state</Text>
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
  display: {
    backgroundColor: '#f0f0f0',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  displayValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  displayText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3498db',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSmall: {
    flex: 1,
  },
  buttonUndo: {
    backgroundColor: '#f39c12',
  },
  buttonRedo: {
    backgroundColor: '#2ecc71',
  },
  buttonDanger: {
    backgroundColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  timeline: {
    marginBottom: 10,
  },
  timelineItem: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    marginRight: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  timelineItemActive: {
    backgroundColor: '#3498db',
  },
  timelineValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  timelineIndex: {
    fontSize: 12,
    color: '#666',
  },
  timelineHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  logContainer: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    minHeight: 120,
  },
  logEmpty: {
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logItem: {
    color: '#ecf0f1',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  codeBox: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
  },
  codeText: {
    color: '#ecf0f1',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  useCase: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TimeTravelScreen;
