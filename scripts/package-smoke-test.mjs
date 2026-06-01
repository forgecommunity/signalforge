import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npm = 'npm';
const npx = 'npx';
const tempRoot = mkdtempSync(join(tmpdir(), 'signalforge-smoke-'));
const packDir = join(tempRoot, 'pack');

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32' && (command === npm || command === npx),
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' },
  });
}

try {
  mkdirSync(packDir);

  const packOutput = execFileSync(
    npm,
    ['pack', '--json', '--pack-destination', packDir],
    { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' }
  );
  const [{ filename }] = JSON.parse(packOutput);
  const tarball = join(packDir, filename);

  for (const reactMajor of [18, 19]) {
    const appDir = join(tempRoot, `consumer-react-${reactMajor}`);
    mkdirSync(appDir);

    writeFileSync(
      join(appDir, 'package.json'),
      JSON.stringify({ name: `signalforge-consumer-react-${reactMajor}`, type: 'module', private: true }, null, 2)
    );

    run(
      npm,
      [
        'install',
        tarball,
        `react@${reactMajor}`,
        `react-dom@${reactMajor}`,
        'typescript@5',
        `@types/react@${reactMajor}`,
        `@types/react-dom@${reactMajor}`,
      ],
      appDir
    );

    writeFileSync(
      join(appDir, 'esm.mjs'),
    `
import { createSignal, createStore, useStoreSelector } from 'signalforge';
import * as root from 'signalforge';
import { createComputed } from 'signalforge/core';
import { useSignalValue } from 'signalforge/react';
import { createLoggerPlugin } from 'signalforge/plugins';
import { safeStringify } from 'signalforge/utils';
import { enableDevTools } from 'signalforge/devtools';
import { signal as createMinimalSignal } from 'signalforge/minimal';

const count = createSignal(1);
const doubled = createComputed(() => count.get() * 2);
const store = createStore({ count: 2 });

if (doubled.get() !== 2) throw new Error('core computed import failed');
if (store.get().count !== 2) throw new Error('store import failed');
if (typeof useStoreSelector !== 'function') throw new Error('root react hook export failed');
if (typeof useSignalValue !== 'function') throw new Error('react subpath export failed');
if (typeof createLoggerPlugin !== 'function') throw new Error('plugins subpath export failed');
if (safeStringify({ ok: true }) !== '{"ok":true}') throw new Error('utils subpath export failed');
if (typeof enableDevTools !== 'function') throw new Error('devtools subpath export failed');
if (createMinimalSignal(3)() !== 3) throw new Error('minimal subpath export failed');
if ('enableDevTools' in root) throw new Error('devtools should not be exported from root');
if ('persist' in root) throw new Error('utils should not be exported from root');
if ('registerPlugin' in root) throw new Error('plugins should not be exported from root');
`
    );

    writeFileSync(
      join(appDir, 'cjs.cjs'),
    `
const { createSignal } = require('signalforge');
const { createComputed } = require('signalforge/core');
const { useSignalValue } = require('signalforge/react');

const count = createSignal(2);
const doubled = createComputed(() => count.get() * 2);

if (doubled.get() !== 4) throw new Error('CJS core import failed');
if (typeof useSignalValue !== 'function') throw new Error('CJS react import failed');
`
    );

    writeFileSync(
      join(appDir, 'typecheck.ts'),
    `
import { createSignal, createStore, type SignalStore } from 'signalforge';
import { createComputed, type Signal } from 'signalforge/core';
import { useStoreSelector } from 'signalforge/react';

const count: Signal<number> = createSignal(1);
const doubled = createComputed(() => count.get() * 2);
const store: SignalStore<{ count: number; label: string }> = createStore({ count: doubled.get(), label: 'ok' });
const label: string = store.select((state) => state.label).get();

if (typeof useStoreSelector !== 'function') {
  throw new Error(label);
}
`
    );

    writeFileSync(
      join(appDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            strict: true,
            skipLibCheck: true,
            jsx: 'react-jsx',
            noEmit: true,
          },
          include: ['typecheck.ts'],
        },
        null,
        2
      )
    );

    run('node', ['esm.mjs'], appDir);
    run('node', ['cjs.cjs'], appDir);
    run(npx, ['tsc', '--noEmit', '-p', 'tsconfig.json'], appDir);

    const packageJson = JSON.parse(readFileSync(join(appDir, 'node_modules/signalforge/package.json'), 'utf8'));
    for (const subpath of ['.', './core', './react', './devtools', './plugins', './utils', './minimal']) {
      if (!packageJson.exports?.[subpath]) {
        throw new Error(`Missing package export: ${subpath}`);
      }
    }

    if (packageJson.exports?.['./react']?.['react-native'] !== './dist/entries/react.js') {
      throw new Error('Missing React Native condition for signalforge/react');
    }

    console.log(`Package smoke test passed for React ${reactMajor}`);
  }

  console.log('Package smoke test passed');
} finally {
  if (!process.env.SIGNALFORGE_KEEP_SMOKE_DIR) {
    rmSync(tempRoot, { recursive: true, force: true });
  } else {
    console.log(`Smoke test directory preserved: ${tempRoot}`);
  }
}
