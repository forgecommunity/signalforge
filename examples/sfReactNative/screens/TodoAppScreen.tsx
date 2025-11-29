/**
 * Example: Todo App
 * Complete todo application with SignalForge
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createComputed } from 'signalforge-alpha';
import { useSignalValue } from 'signalforge-alpha/react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const todos = createSignal<Todo[]>([
  { id: 1, text: 'Learn SignalForge', done: true },
  { id: 2, text: 'Build amazing app', done: false },
  { id: 3, text: 'Share with friends', done: false },
]);

const completedCount = createComputed(() => {
  return todos.get().filter(todo => todo.done).length;
});

const activeCount = createComputed(() => {
  return todos.get().filter(todo => !todo.done).length;
});

const totalCount = createComputed(() => {
  return todos.get().length;
});

export default function TodoAppScreen() {
  const todoList = useSignalValue(todos);
  const completed = useSignalValue(completedCount);
  const active = useSignalValue(activeCount);
  const total = useSignalValue(totalCount);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTodo = () => {
    if (inputText.trim()) {
      const newId = todoList.length > 0 ? Math.max(...todoList.map(t => t.id)) + 1 : 1;
      todos.set([...todoList, { id: newId, text: inputText, done: false }]);
      setInputText('');
    }
  };

  const toggleTodo = (id: number) => {
    todos.set(
      todoList.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    todos.set(todoList.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    todos.set(todoList.filter(todo => !todo.done));
  };

  const filteredTodos = todoList.filter(todo => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Todo App</Text>
        <Text style={styles.description}>
          Complete todo app with filtering, stats, and automatic updates!
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statBox, styles.statActive]}>
            <Text style={styles.statNumber}>{active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statBox, styles.statCompleted]}>
            <Text style={styles.statNumber}>{completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.filterActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.todoList}>
          {filteredTodos.length === 0 ? (
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos.`}
            </Text>
          ) : (
            filteredTodos.map(todo => (
              <View key={todo.id} style={styles.todoItem}>
                <TouchableOpacity
                  style={styles.todoCheckbox}
                  onPress={() => toggleTodo(todo.id)}
                >
                  <Text style={styles.checkboxIcon}>
                    {todo.done ? '✅' : '⬜'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.todoText, todo.done && styles.todoTextDone]}>
                  {todo.text}
                </Text>
                <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {completed > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearCompleted}>
            <Text style={styles.clearButtonText}>Clear Completed ({completed})</Text>
          </TouchableOpacity>
        )}

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Code Snippet:</Text>
          <Text style={styles.code}>
            {`const todos = createSignal([]);\n\nconst completedCount = createComputed(() => {\n  return todos.get()\n    .filter(todo => todo.done)\n    .length;\n});\n\nconst activeCount = createComputed(() => {\n  return todos.get()\n    .filter(todo => !todo.done)\n    .length;\n});\n\n// Auto-updates as todos change! ✨`}
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statActive: {
    backgroundColor: '#dbeafe',
  },
  statCompleted: {
    backgroundColor: '#d1fae5',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  todoList: {
    gap: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  todoCheckbox: {
    marginRight: 10,
  },
  checkboxIcon: {
    fontSize: 20,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  deleteButton: {
    fontSize: 18,
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontStyle: 'italic',
    padding: 30,
  },
  clearButton: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
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
});
