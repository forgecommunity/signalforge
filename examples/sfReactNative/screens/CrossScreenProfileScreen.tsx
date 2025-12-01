/**
 * Profile Screen - Part 1 of Cross-Screen Demo
 * Shows how to read and update global user state
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSignalValue } from 'signalforge/react';
import { 
  currentUser, 
  updateUserName, 
  updateUserEmail, 
  addPoints,
  cartItemCount 
} from '../shared/globalState';

export default function CrossScreenProfileScreen() {
  const user = useSignalValue(currentUser);
  const itemsInCart = useSignalValue(cartItemCount);
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateUserName(nameInput.trim());
    }
  };

  const handleSaveEmail = () => {
    if (emailInput.trim()) {
      updateUserEmail(emailInput.trim());
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Profile</Text>
        <Text style={styles.description}>
          Update your profile here. Changes are visible across all screens instantly!
        </Text>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{user.avatar}</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.pointsBadge}>
          <Text style={styles.pointsLabel}>Points Balance</Text>
          <Text style={styles.pointsValue}>{user.points}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your name"
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSaveName}
          >
            <Text style={styles.buttonText}>Update Name</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSaveEmail}
          >
            <Text style={styles.buttonText}>Update Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionGroup}>
          <Text style={styles.actionLabel}>Quick Actions</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={() => addPoints(10)}
          >
            <Text style={styles.buttonText}>Add 10 Points</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={() => addPoints(50)}
          >
            <Text style={styles.buttonText}>Add 50 Points</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Updates Demo</Text>
        <Text style={styles.description}>
          Go to the Store or Cart screens and make changes. Watch this screen update automatically!
        </Text>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Items in Cart</Text>
          <Text style={styles.statValue}>{itemsInCart}</Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            The cart count above updates live when you add items in the Store screen.
            No props needed, no context provider, no Redux - just signals!
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How It Works</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.code}>
{`// In shared/globalState.ts
export const currentUser = createSignal({
  name: 'Guest',
  points: 100
});

// In this screen
const user = useSignalValue(currentUser);

// Update from anywhere
updateUserName('John');
// This screen re-renders automatically!`}
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
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  avatar: {
    fontSize: 48,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  pointsBadge: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    marginBottom: 5,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionGroup: {
    marginTop: 10,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  statBox: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 8,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#e5e7eb',
    lineHeight: 18,
  },
});
