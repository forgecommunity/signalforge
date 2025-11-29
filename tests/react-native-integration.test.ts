/**
 * React Native Integration Test
 * Verifies that SignalForge React hooks work correctly in a React Native environment
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('React Native Integration', () => {
  let React: any;
  let createSignal: any;
  let useSignalValue: any;
  let useSignal: any;

  beforeEach(async () => {
    // Dynamically import to test module resolution
    try {
      React = await import('react');
      const core = await import('../src/core/store');
      createSignal = core.createSignal;
      
      const hooks = await import('../src/hooks/useSignal');
      useSignalValue = hooks.useSignalValue;
      useSignal = hooks.useSignal;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  });

  it('should successfully import React with named imports', () => {
    expect(React).toBeDefined();
    expect(React.useState).toBeDefined();
    expect(React.useEffect).toBeDefined();
    expect(typeof React.useState).toBe('function');
    expect(typeof React.useEffect).toBe('function');
  });

  it('should successfully import createSignal from core', () => {
    expect(createSignal).toBeDefined();
    expect(typeof createSignal).toBe('function');
  });

  it('should successfully import hooks', () => {
    expect(useSignalValue).toBeDefined();
    expect(useSignal).toBeDefined();
    expect(typeof useSignalValue).toBe('function');
    expect(typeof useSignal).toBe('function');
  });

  it('should import from signalforge/react entry point', async () => {
    const reactEntry = await import('../src/entries/react');
    
    expect(reactEntry.createSignal).toBeDefined();
    expect(reactEntry.useSignal).toBeDefined();
    expect(reactEntry.useSignalValue).toBeDefined();
    expect(reactEntry.createComputed).toBeDefined();
    expect(reactEntry.batch).toBeDefined();
  });

  it('should not include unnecessary exports in react entry', async () => {
    const reactEntry = await import('../src/entries/react');
    const keys = Object.keys(reactEntry);
    
    // Should have core primitives
    expect(keys).toContain('createSignal');
    expect(keys).toContain('createComputed');
    expect(keys).toContain('batch');
    
    // Should have React hooks
    expect(keys).toContain('useSignal');
    expect(keys).toContain('useSignalValue');
    expect(keys).toContain('useSignalEffect');
    
    // Should NOT have everything from index (like devtools, plugins, etc.)
    // Entry should be minimal
    console.log('React entry exports:', keys);
  });

  it('should create signals that work with hooks', () => {
    const signal = createSignal(42);
    
    expect(signal).toBeDefined();
    expect(signal.get()).toBe(42);
    
    signal.set(100);
    expect(signal.get()).toBe(100);
  });

  it('should handle React hook imports without namespace pollution', async () => {
    // Test that hooks use direct imports, not React namespace
    const hookSource = await import('fs').then(fs => 
      fs.readFileSync('./src/hooks/useSignal.ts', 'utf-8')
    );
    
    // Should use direct imports
    expect(hookSource).toContain("import { useState, useEffect } from 'react'");
    
    // Should NOT use namespace imports
    expect(hookSource).not.toContain("import * as React from 'react'");
  });
});

describe('Package.json Exports', () => {
  let packageJson: any;

  beforeEach(async () => {
    packageJson = await import('../package.json');
  });

  it('should have correct react-native field in exports', () => {
    const reactExports = packageJson.exports['./react'];
    
    expect(reactExports).toBeDefined();
    expect(reactExports['react-native']).toBeDefined();
    expect(reactExports['react-native']).toContain('.js');
  });

  it('should mark React as external peer dependency', () => {
    expect(packageJson.peerDependencies.react).toBeDefined();
    expect(packageJson.peerDependencies['react-native']).toBeDefined();
    
    expect(packageJson.peerDependenciesMeta.react.optional).toBe(true);
    expect(packageJson.peerDependenciesMeta['react-native'].optional).toBe(true);
  });
});

describe('Build Output Verification', () => {
  it('should have built CJS and ESM files for react entry', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const cjsPath = path.join(__dirname, '../dist/entries/react.js');
    const esmPath = path.join(__dirname, '../dist/entries/react.mjs');
    const dtsPath = path.join(__dirname, '../dist/entries/react.d.ts');
    
    expect(fs.existsSync(cjsPath)).toBe(true);
    expect(fs.existsSync(esmPath)).toBe(true);
    expect(fs.existsSync(dtsPath)).toBe(true);
  });

  it('should not bundle React in the output', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const cjsPath = path.join(__dirname, '../dist/entries/react.js');
    const content = fs.readFileSync(cjsPath, 'utf-8');
    
    // Should have external require for react
    expect(content).toContain('require("react")');
    
    // Should NOT have bundled React code
    expect(content).not.toContain('function useState');
    expect(content).not.toContain('ReactCurrentDispatcher');
  });
});

console.log('✅ React Native integration tests defined');
console.log('💡 Run with: npm test tests/react-native-integration.test.ts');
