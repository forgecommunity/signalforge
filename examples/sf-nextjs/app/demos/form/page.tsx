'use client';

import { createSignal } from 'signalforge-alpha/core';
import { useSignalValue } from 'signalforge-alpha/react';
import { createComputed } from 'signalforge-alpha/core';
import { useState } from 'react';
import DemoLayout from '../../components/DemoLayout';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
}

export default function FormValidationDemo() {
  const [formDataSignal] = useState(() => createSignal<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
  }));
  const formData = useSignalValue(formDataSignal);

  const [emailError] = useState(() => createComputed(() => {
    const data = formDataSignal.get();
    const email = data.email;
    if (!email) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Invalid email format';
    }
    return '';
  }));
  const emailErrorValue = useSignalValue(emailError);

  const [passwordError] = useState(() => createComputed(() => {
    const data = formDataSignal.get();
    const password = data.password;
    if (!password) return '';
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain an uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain a number';
    }
    return '';
  }));
  const passwordErrorValue = useSignalValue(passwordError);

  const [confirmPasswordError] = useState(() => createComputed(() => {
    const data = formDataSignal.get();
    const { password, confirmPassword } = data;
    if (!confirmPassword) return '';
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  }));
  const confirmPasswordErrorValue = useSignalValue(confirmPasswordError);

  const [ageError] = useState(() => createComputed(() => {
    const data = formDataSignal.get();
    const age = data.age;
    if (!age) return '';
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return 'Age must be a number';
    if (ageNum < 13) return 'You must be at least 13 years old';
    if (ageNum > 120) return 'Please enter a valid age';
    return '';
  }));
  const ageErrorValue = useSignalValue(ageError);

  const [isFormValid] = useState(() => createComputed(() => {
    const data = formDataSignal.get();
    return (
      data.email &&
      data.password &&
      data.confirmPassword &&
      data.age &&
      !emailErrorValue &&
      !passwordErrorValue &&
      !confirmPasswordErrorValue &&
      !ageErrorValue
    );
  }));
  const isFormValidValue = useSignalValue(isFormValid);

  const updateField = (field: keyof FormData, value: string) => {
    formDataSignal.set({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValidValue) {
      alert('Form submitted successfully! ✅');
    }
  };

  return (
    <DemoLayout
      title="Form Validation"
      description="Reactive form with real-time validation using computed signals"
    >
      <div className="space-y-6">
        {/* Form Status */}
        <div className={`p-4 rounded-lg text-center ${
          isFormValidValue
            ? 'bg-green-50 dark:bg-green-900'
            : 'bg-gray-50 dark:bg-gray-700'
        }`}>
          <div className={`text-2xl font-bold mb-2 ${
            isFormValidValue
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isFormValidValue ? '✅ Form Valid' : '📝 Fill in the form'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                emailErrorValue
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              placeholder="user@example.com"
            />
            {emailErrorValue && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {emailErrorValue}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                passwordErrorValue
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              placeholder="Enter strong password"
            />
            {passwordErrorValue && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {passwordErrorValue}
              </p>
            )}
            {!passwordErrorValue && formData.password && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                ✓ Password is strong
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                confirmPasswordErrorValue
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              placeholder="Confirm your password"
            />
            {confirmPasswordErrorValue && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {confirmPasswordErrorValue}
              </p>
            )}
            {!confirmPasswordErrorValue && formData.confirmPassword && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                ✓ Passwords match
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                ageErrorValue
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              placeholder="Enter your age"
            />
            {ageErrorValue && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {ageErrorValue}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValidValue}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
              isFormValidValue
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Form
          </button>
        </form>

        {/* Code Example */}
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-green-400 text-sm">
{`import { useSignal, useComputed } from 'signalforge-alpha/react';

const formData = useSignal({ email: '', password: '' });

// Validation computed automatically
const emailError = useComputed(() => {
  const email = formData.value.email;
  if (!email) return '';
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return 'Invalid email';
  }
  return '';
});

const isValid = useComputed(() => 
  formData.value.email && !emailError.value
);`}
          </pre>
        </div>
      </div>
    </DemoLayout>
  );
}
