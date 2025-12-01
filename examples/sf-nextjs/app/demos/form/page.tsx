'use client';

import { createSignal } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import { createComputed } from 'signalforge/core';
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
      title="📝 Form Validation - Real-Time Validation"
      description="Reactive form with real-time validation using computed signals"
    >
      <div className="space-y-8">
        {/* What You'll Learn */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
            📚 What You'll Learn
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Build reactive forms with real-time validation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Use computed signals for validation rules</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Create complex validation logic (email, password strength, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Handle form submission with proper validation</span>
            </li>
          </ul>
        </div>

        {/* Interactive Demo Title */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎮 Try It: Registration Form
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fill out the form - watch validation happen in real-time!
          </p>
        </div>

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

        {/* How It Works */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            🚀 How It Works (3 Simple Steps)
          </h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="font-bold text-blue-600 dark:text-blue-400 mb-2">Step 1: Create form data signal</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const formData = createSignal(&#123; email: '', password: '' &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-green-500">
              <div className="font-bold text-green-600 dark:text-green-400 mb-2">Step 2: Create validation computed signals</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                const emailError = createComputed(() =&gt; &#123;<br/>
                &nbsp;&nbsp;return validateEmail(formData.get().email);<br/>
                &#125;);
              </code>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="font-bold text-purple-600 dark:text-purple-400 mb-2">Step 3: Auto-update on every change!</div>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded block">
                formData.set(&#123; ...formData.get(), email: newEmail &#125;);<br/>
                // emailError recalculates automatically! ✨
              </code>
            </div>
          </div>
        </div>

        {/* Complete Code Example */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            💻 Complete Code Example
          </h3>
          <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`import { createSignal, createComputed } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import { useState } from 'react';

function RegistrationForm() {
  const [formData] = useState(() => createSignal({
    email: '',
    password: '',
    confirmPassword: ''
  }));
  
  // Validation rules as computed signals
  const [emailError] = useState(() => createComputed(() => {
    const { email } = formData.get();
    if (!email) return '';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return 'Invalid email format';
    }
    return '';
  }));
  
  const [passwordError] = useState(() => createComputed(() => {
    const { password } = formData.get();
    if (!password) return '';
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Must contain uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Must contain a number';
    }
    return '';
  }));
  
  const [isFormValid] = useState(() => createComputed(() => {
    const data = formData.get();
    return data.email && data.password && 
           !emailErrorValue && !passwordErrorValue;
  }));
  
  const emailErrorValue = useSignalValue(emailError);
  const isFormValidValue = useSignalValue(isFormValid);
  
  return (
    <form>
      <input 
        value={formData.get().email}
        onChange={(e) => formData.set({
          ...formData.get(), 
          email: e.target.value 
        })}
      />
      {emailErrorValue && <p>{emailErrorValue}</p>}
      
      <button disabled={!isFormValidValue}>
        Submit
      </button>
    </form>
  );
}

// ✨ Benefits:
// • Real-time validation as user types
// • No manual validation calls needed
// • Clean, declarative code
// • Automatic dependency tracking`}
            </pre>
          </div>
        </div>

        {/* Real World Use Cases */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
            🌍 Real-World Use Cases
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-blue-600 mb-1">📧 Login Forms</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Validate email and password requirements
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-purple-600 mb-1">✍️ Registration</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Check username availability, password strength
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-green-600 mb-1">💳 Checkout Forms</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Validate credit card, address, postal codes
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded p-3">
              <div className="font-semibold text-orange-600 mb-1">📝 Survey Forms</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Required fields, conditional validation
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
            💡 Best Practices
          </h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong>Use computed signals for validation</strong>
                <p className="text-sm">Keep validation logic separate and reusable.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong>Validate as user types</strong>
                <p className="text-sm">Give immediate feedback for better UX.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>Show errors only after interaction</strong>
                <p className="text-sm">Don't overwhelm users with errors on empty fields.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <strong>Disable submit until valid</strong>
                <p className="text-sm">Prevent form submission with invalid data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🎓 Next Steps</h3>
          <p className="mb-4">Master form validation? Try these demos:</p>
          <div className="flex flex-wrap gap-3">
            <a href="/demos/computed" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Computed Signals →
            </a>
            <a href="/demos/persistent" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Persistent Forms →
            </a>
            <a href="/demos/effects" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">
              Effects →
            </a>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
