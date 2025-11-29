/**
 * Example: Form Validation
 * Real-time validation with computed signals
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { createSignal, createComputed } from 'signalforge';
import { useSignalValue } from 'signalforge/react';

const email = createSignal('');
const password = createSignal('');
const confirmPassword = createSignal('');

const isEmailValid = createComputed(() => {
  const value = email.get();
  return value.includes('@') && value.includes('.');
});

const isPasswordValid = createComputed(() => {
  return password.get().length >= 8;
});

const passwordsMatch = createComputed(() => {
  return password.get() === confirmPassword.get() && confirmPassword.get().length > 0;
});

const canSubmit = createComputed(() => {
  return isEmailValid.get() && isPasswordValid.get() && passwordsMatch.get();
});

export default function FormValidationScreen() {
  const currentEmail = useSignalValue(email);
  const currentPassword = useSignalValue(password);
  const currentConfirmPassword = useSignalValue(confirmPassword);
  const emailValid = useSignalValue(isEmailValid);
  const passwordValid = useSignalValue(isPasswordValid);
  const passwordMatch = useSignalValue(passwordsMatch);
  const submitEnabled = useSignalValue(canSubmit);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Form Validation</Text>
        <Text style={styles.description}>
          Real-time validation with automatic updates. No manual checking needed!
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              currentEmail.length > 0 && (emailValid ? styles.inputValid : styles.inputInvalid)
            ]}
            placeholder="Enter your email"
            value={currentEmail}
            onChangeText={(text) => email.set(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {currentEmail.length > 0 && (
            <View style={styles.validationRow}>
              <Text style={emailValid ? styles.validText : styles.invalidText}>
                {emailValid ? '✅ Valid email' : '❌ Must contain @ and .'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              currentPassword.length > 0 && (passwordValid ? styles.inputValid : styles.inputInvalid)
            ]}
            placeholder="Enter password (min 8 chars)"
            value={currentPassword}
            onChangeText={(text) => password.set(text)}
            secureTextEntry
          />
          {currentPassword.length > 0 && (
            <View style={styles.validationRow}>
              <Text style={passwordValid ? styles.validText : styles.invalidText}>
                {passwordValid ? '✅ Strong password' : `❌ ${currentPassword.length}/8 characters`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              currentConfirmPassword.length > 0 && (passwordMatch ? styles.inputValid : styles.inputInvalid)
            ]}
            placeholder="Confirm your password"
            value={currentConfirmPassword}
            onChangeText={(text) => confirmPassword.set(text)}
            secureTextEntry
          />
          {currentConfirmPassword.length > 0 && (
            <View style={styles.validationRow}>
              <Text style={passwordMatch ? styles.validText : styles.invalidText}>
                {passwordMatch ? '✅ Passwords match' : '❌ Passwords do not match'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitEnabled ? styles.submitEnabled : styles.submitDisabled
          ]}
          onPress={handleSubmit}
          disabled={!submitEnabled}
        >
          <Text style={styles.submitButtonText}>
            {submitted ? '✅ Form Submitted!' : submitEnabled ? 'Submit Form' : 'Complete Form to Submit'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>📊 Validation Status:</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>{emailValid ? '🟢' : '🔴'}</Text>
              <Text style={styles.statusText}>Email valid</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>{passwordValid ? '🟢' : '🔴'}</Text>
              <Text style={styles.statusText}>Password strong</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>{passwordMatch ? '🟢' : '🔴'}</Text>
              <Text style={styles.statusText}>Passwords match</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusDot}>{submitEnabled ? '🟢' : '🔴'}</Text>
              <Text style={styles.statusText}>Ready to submit</Text>
            </View>
          </View>
        </View>

        <View style={styles.codeBlock}>
          <Text style={styles.codeTitle}>💡 Validation Code:</Text>
          <Text style={styles.code}>
            {`const email = createSignal('');\nconst password = createSignal('');\n\nconst isEmailValid = createComputed(() => {\n  return email.get().includes('@');\n});\n\nconst isPasswordValid = createComputed(() => {\n  return password.get().length >= 8;\n});\n\nconst canSubmit = createComputed(() => {\n  return isEmailValid.get() &&\n         isPasswordValid.get();\n});\n\n// Auto-validates as you type! ✨`}
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputValid: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  inputInvalid: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  validationRow: {
    marginTop: 5,
  },
  validText: {
    fontSize: 12,
    color: '#16a34a',
  },
  invalidText: {
    fontSize: 12,
    color: '#dc2626',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitEnabled: {
    backgroundColor: '#10b981',
  },
  submitDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#4b5563',
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
