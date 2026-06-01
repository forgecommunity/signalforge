import { execFileSync } from 'node:child_process';

const npm = 'npm';
const output = execFileSync(npm, ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});

const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));

const required = [
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'package.json',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/index.mjs',
  'dist/entries/core.d.ts',
  'dist/entries/core.js',
  'dist/entries/core.mjs',
  'dist/entries/react.d.ts',
  'dist/entries/react.js',
  'dist/entries/react.mjs',
  'dist/entries/devtools.d.ts',
  'dist/entries/devtools.js',
  'dist/entries/devtools.mjs',
  'dist/entries/plugins.d.ts',
  'dist/entries/plugins.js',
  'dist/entries/plugins.mjs',
  'dist/entries/utils.d.ts',
  'dist/entries/utils.js',
  'dist/entries/utils.mjs',
  'dist/core/minimal.d.ts',
  'dist/core/minimal.js',
  'dist/core/minimal.mjs',
  'src/native/NativeSignalForge.ts',
  'react-native.config.js',
  'signalforge.podspec',
  'CMakeLists.txt',
];

const forbiddenPrefixes = [
  'tests/',
  'examples/',
  'benchmarks/',
  '.github/',
  'node_modules/',
];

for (const file of required) {
  if (!files.has(file)) {
    throw new Error(`Missing required package file: ${file}`);
  }
}

for (const file of files) {
  for (const prefix of forbiddenPrefixes) {
    if (file.startsWith(prefix)) {
      throw new Error(`Unexpected package file: ${file}`);
    }
  }
}

console.log(`Package contents test passed (${files.size} files, ${pack.unpackedSize} bytes unpacked)`);
