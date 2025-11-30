import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createSignal, withSignals } from 'signalforge/react';

const temperature = createSignal(72);
const humidity = createSignal(40);

interface ClimateProps {
  temperature: number;
  humidity: number;
}

class ClimatePanel extends React.Component<ClimateProps> {
  render() {
    const { temperature: tempValue, humidity: humidityValue } = this.props;

    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Class Component (WithSignals)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Temperature</Text>
          <Text style={styles.value}>{tempValue}°F</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Humidity</Text>
          <Text style={styles.value}>{humidityValue}%</Text>
        </View>
        <Text style={styles.hint}>Values stay in sync without hooks.</Text>
      </View>
    );
  }
}

const ClimatePanelWithSignals = withSignals(ClimatePanel, { temperature, humidity });

export default function ClassComponentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SignalForge in a Class Component</Text>
      <Text style={styles.subtitle}>
        `withSignals` injects signal values as props and unsubscribes automatically.
      </Text>

      <ClimatePanelWithSignals />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => temperature.set((current) => current + 1)}
        >
          <Text style={styles.buttonText}>Increase Temp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => humidity.set((current) => Math.max(0, current - 1))}
        >
          <Text style={styles.buttonText}>Lower Humidity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={() => {
            temperature.set(72);
            humidity.set(40);
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  panel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    color: '#4b5563',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#6b7280',
  },
  controls: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

