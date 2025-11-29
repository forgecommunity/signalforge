/**
 * Persistent Signal Demo
 * Auto-save to storage
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { createSignal } from 'signalforge-alpha';
import { persist } from 'signalforge-alpha/utils';
import { useSignalValue } from 'signalforge-alpha/react';

// Create regular signals first
const username = createSignal('Guest');
const theme = createSignal('light');
const counter = createSignal(0);

// Initialize persistence in the component
let persistInitialized = false;

function PersistentSignalScreen() {
  useEffect(() => {
    if (!persistInitialized) {
      persistInitialized = true;
      // Set up persistence after component mounts
      persist(username, { key: 'demo_username' });
      persist(theme, { key: 'demo_theme' });
      persist(counter, { key: 'demo_counter' });
    }
  }, []);

  const currentUsername = useSignalValue(username);
  const currentTheme = useSignalValue(theme);
  const currentCounter = useSignalValue(counter);
  const [nameInput, setNameInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    addLog('Screen loaded - values restored from storage');
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const saveName = () => {
    if (nameInput.trim()) {
      username.set(nameInput);
      addLog(`Username saved: "${nameInput}"`);
      setNameInput('');
    }
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    theme.set(newTheme);
    addLog(`Theme changed to: ${newTheme}`);
  };

  const incrementCounter = () => {
    counter.set(counter.get() + 1);
    addLog(`Counter incremented to: ${counter.get()}`);
  };

  const resetAll = () => {
    username.set('Guest');
    theme.set('light');
    counter.set(0);
    addLog('All values reset to defaults');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💾 Persistent Signals</Text>
        <Text style={styles.description}>
          These signals automatically save to AsyncStorage! Close the app and come back - your data will be restored! 🎉
        </Text>

        <View style={styles.alertBox}>
          <Text style={styles.alertIcon}>💡</Text>
          <Text style={styles.alertText}>
            Try changing values, closing the app, and reopening - everything will be restored!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Username</Text>
          <View style={styles.displayCard}>
            <Text style={styles.displayLabel}>Current:</Text>
            <Text style={styles.displayValue}>{currentUsername}</Text>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter new username"
              value={nameInput}
              onChangeText={setNameInput}
              onSubmitEditing={saveName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveName}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Theme</Text>
          <View style={styles.displayCard}>
            <Text style={styles.displayLabel}>Current:</Text>
            <View style={[
              styles.themeBadge,
              currentTheme === 'dark' ? styles.themeDark : styles.themeLight
            ]}>
              <Text style={styles.themeText}>
                {currentTheme === 'light' ? '☀️ Light' : '🌙 Dark'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={toggleTheme}>
            <Text style={styles.buttonText}>Toggle Theme</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 Counter</Text>
          <View style={styles.counterDisplay}>
            <Text style={styles.counterValue}>{currentCounter}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={incrementCounter}
            >
              <Text style={styles.buttonText}>Increment (+1)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                counter.set(0);
                addLog('Counter reset to 0');
              }}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={resetAll}
        >
          <Text style={styles.buttonText}>🗑️ Reset All to Defaults</Text>
        </TouchableOpacity>

        <View style={styles.logSection}>
          <Text style={styles.logTitle}>📝 Activity Log:</Text>
          <View style={styles.logContainer}>
            {logs.slice(-5).reverse().map((log, index) => (
              <Text key={index} style={styles.logItem}>{log}</Text>
            ))}
          </View>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Example:</Text>
          <Text style={styles.code}>
            {`// Create signals\nconst username = createSignal('Guest');\nconst theme = createSignal('light');\n\n// Set up persistence\npersist(username, { key: 'user_name' });\npersist(theme, { key: 'app_theme' });\n\n// Change value - auto-saves! ✨\nusername.set('Alice');\ntheme.set('dark');\n\n// Reload app - values restored! 🎉`}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>✨ Features</Text>
        <View style={styles.featureList}>
          <Text style={styles.feature}>✅ Automatic saving to AsyncStorage</Text>
          <Text style={styles.feature}>✅ Automatic loading on app start</Text>
          <Text style={styles.feature}>✅ Debounced saves (efficient)</Text>
          <Text style={styles.feature}>✅ Works on iOS & Android</Text>
          <Text style={styles.feature}>✅ Perfect for user preferences</Text>
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
    marginBottom: 15,
    lineHeight: 20,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  displayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  displayLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 10,
  },
  displayValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
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
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  themeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  themeLight: {
    backgroundColor: '#fef3c7',
  },
  themeDark: {
    backgroundColor: '#1f2937',
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  counterDisplay: {
    backgroundColor: '#dbeafe',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonPrimary: {
    flex: 1,
    marginTop: 0,
  },
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
    marginTop: 0,
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
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
    fontSize: 10,
    color: '#e5e7eb',
    lineHeight: 15,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#16a34a',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default PersistentSignalScreen;
