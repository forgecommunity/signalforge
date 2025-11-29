/**
 * Big Data Handling Demo
 * Performance with large datasets
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { createSignal, batch } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';

// Large dataset signals
const largeArray = createSignal<any[]>([]);
const filteredData = createSignal<any[]>([]);
const stats = createSignal({ total: 0, filtered: 0, renderTime: 0 });

// Generate fake data
const generateData = (count: number) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      value: Math.floor(Math.random() * 1000),
      category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      active: Math.random() > 0.5,
    });
  }
  return data;
};

function BigDataScreen() {
  const arrayData = useSignalValue(largeArray);
  const filtered = useSignalValue(filteredData);
  const statsData = useSignalValue(stats);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-5));
  };

  useEffect(() => {
    addLog('Big Data screen initialized');
    // Start with small dataset
    handleGenerate(100);
  }, []);

  const handleGenerate = (count: number) => {
    const startTime = performance.now();
    const data = generateData(count);
    
    batch(() => {
      largeArray.set(data);
      filteredData.set(data);
      stats.set({
        total: data.length,
        filtered: data.length,
        renderTime: performance.now() - startTime,
      });
    });

    addLog(`Generated ${count} items in ${(performance.now() - startTime).toFixed(2)}ms`);
  };

  const handleFilter = (category: string | null) => {
    const startTime = performance.now();
    setSelectedCategory(category);

    const data = largeArray.get();
    const filtered = category 
      ? data.filter(item => item.category === category)
      : data;

    batch(() => {
      filteredData.set(filtered);
      stats.set({
        total: data.length,
        filtered: filtered.length,
        renderTime: performance.now() - startTime,
      });
    });

    addLog(`Filtered to ${filtered.length} items (${(performance.now() - startTime).toFixed(2)}ms)`);
  };

  const handleSort = (field: 'name' | 'value') => {
    const startTime = performance.now();
    const data = [...filteredData.get()];
    
    data.sort((a, b) => {
      if (field === 'value') {
        return b.value - a.value;
      }
      return a.name.localeCompare(b.name);
    });

    filteredData.set(data);
    addLog(`Sorted by ${field} (${(performance.now() - startTime).toFixed(2)}ms)`);
  };

  const handleBatchUpdate = () => {
    const startTime = performance.now();
    const data = [...largeArray.get()];
    
    // Update all items in a batch
    batch(() => {
      data.forEach(item => {
        item.value = Math.floor(Math.random() * 1000);
      });
      largeArray.set(data);
      if (!selectedCategory) {
        filteredData.set(data);
      }
    });

    addLog(`Batch updated ${data.length} items (${(performance.now() - startTime).toFixed(2)}ms)`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemName}>{item.name}</Text>
        <Text style={[styles.listItemBadge, styles[`badge${item.category}`]]}>
          {item.category}
        </Text>
      </View>
      <Text style={styles.listItemValue}>Value: {item.value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>📊 Big Data Handling</Text>
        <Text style={styles.subtitle}>Efficient performance with large datasets</Text>

        {/* Stats Dashboard */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Performance Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{statsData.total}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{statsData.filtered}</Text>
              <Text style={styles.statLabel}>Filtered</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{statsData.renderTime.toFixed(1)}ms</Text>
              <Text style={styles.statLabel}>Render Time</Text>
            </View>
          </View>
        </View>

        {/* Generate Data */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎲 Generate Data</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall]}
              onPress={() => handleGenerate(100)}
            >
              <Text style={styles.buttonText}>100</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall]}
              onPress={() => handleGenerate(500)}
            >
              <Text style={styles.buttonText}>500</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall]}
              onPress={() => handleGenerate(1000)}
            >
              <Text style={styles.buttonText}>1K</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall]}
              onPress={() => handleGenerate(5000)}
            >
              <Text style={styles.buttonText}>5K</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>⚡ Notice: Fast generation even with large datasets!</Text>
        </View>

        {/* Filter Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Filter by Category</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall, !selectedCategory && styles.buttonActive]}
              onPress={() => handleFilter(null)}
            >
              <Text style={styles.buttonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall, selectedCategory === 'A' && styles.buttonActive]}
              onPress={() => handleFilter('A')}
            >
              <Text style={styles.buttonText}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall, selectedCategory === 'B' && styles.buttonActive]}
              onPress={() => handleFilter('B')}
            >
              <Text style={styles.buttonText}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall, selectedCategory === 'C' && styles.buttonActive]}
              onPress={() => handleFilter('C')}
            >
              <Text style={styles.buttonText}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall, selectedCategory === 'D' && styles.buttonActive]}
              onPress={() => handleFilter('D')}
            >
              <Text style={styles.buttonText}>D</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort & Update */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Operations</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall]}
              onPress={() => handleSort('name')}
            >
              <Text style={styles.buttonText}>Sort by Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSmall]}
              onPress={() => handleSort('value')}
            >
              <Text style={styles.buttonText}>Sort by Value</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleBatchUpdate}
          >
            <Text style={styles.buttonText}>🔄 Batch Update All Values</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>💡 Batch updates are atomic - all changes happen together</Text>
        </View>

        {/* Activity Log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Activity Log</Text>
          <View style={styles.logContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logItem}>{log}</Text>
            ))}
          </View>
        </View>

        {/* Performance Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Performance Optimizations</Text>
          <Text style={styles.tip}>✅ <Text style={styles.bold}>batch()</Text> - Group multiple updates</Text>
          <Text style={styles.tip}>✅ <Text style={styles.bold}>Computed signals</Text> - Automatic memoization</Text>
          <Text style={styles.tip}>✅ <Text style={styles.bold}>Lazy updates</Text> - Only notify when changed</Text>
          <Text style={styles.tip}>✅ <Text style={styles.bold}>Fine-grained reactivity</Text> - Minimal re-renders</Text>
          <Text style={styles.tip}>✅ <Text style={styles.bold}>No virtual DOM</Text> - Direct updates</Text>
        </View>

        {/* Code Example */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💻 Big Data Pattern</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>
{`// Efficient large dataset handling
const data = createSignal(bigArray);

// Batch updates for performance
batch(() => {
  bigArray.forEach(item => {
    item.value = newValue;
  });
  data.set([...bigArray]);
});

// Filter without full re-render
const filtered = createComputed(() => 
  data.get().filter(item => 
    item.category === selected
  )
);`}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Data List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            📋 Data ({filtered.length} items)
          </Text>
        </View>
        <FlatList
          data={filtered.slice(0, 100)}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
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
  buttonActive: {
    backgroundColor: '#2ecc71',
  },
  buttonWarning: {
    backgroundColor: '#f39c12',
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
  logContainer: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    minHeight: 100,
  },
  logItem: {
    color: '#ecf0f1',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  tip: {
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
  listContainer: {
    height: 250,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#ecf0f1',
  },
  listHeader: {
    padding: 15,
    backgroundColor: '#3498db',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  listItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  listItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgeA: {
    backgroundColor: '#e74c3c',
  },
  badgeB: {
    backgroundColor: '#3498db',
  },
  badgeC: {
    backgroundColor: '#2ecc71',
  },
  badgeD: {
    backgroundColor: '#f39c12',
  },
  listItemValue: {
    fontSize: 13,
    color: '#666',
  },
});

export default BigDataScreen;
