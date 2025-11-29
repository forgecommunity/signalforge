/**
 * Build configuration for SignalForge
 * Generates optimized bundles with code splitting
 */

const esbuild = require('esbuild');
const { join } = require('path');
const { readFileSync, writeFileSync, mkdirSync } = require('fs');

const entries = [
  { in: 'src/index.ts', out: 'index' },
  { in: 'src/entries/core.ts', out: 'entries/core' },
  { in: 'src/entries/react.ts', out: 'entries/react' },
  { in: 'src/entries/devtools.ts', out: 'entries/devtools' },
  { in: 'src/entries/plugins.ts', out: 'entries/plugins' },
  { in: 'src/entries/utils.ts', out: 'entries/utils' },
  { in: 'src/core/minimal.ts', out: 'core/minimal' },
];

const sharedConfig = {
  bundle: true,
  minify: true,
  treeShaking: true,
  target: 'es2020',
  platform: 'neutral',
  // Mark React and React Native as external to avoid bundling them
  external: ['react', 'react-dom', 'react-native', 'react/jsx-runtime'],
  // Keep NODE_ENV checks for better tree-shaking in consuming apps
  define: {
    '__DEV__': 'false',
  },
  legalComments: 'none',
  // Don't drop console in library code - let consumers decide
  drop: ['debugger'],
  pure: ['console.log', 'console.warn'],
};

async function build() {
  console.log('🔨 Building SignalForge...\n');
  
  // Create dist directory
  try {
    mkdirSync(join(__dirname, 'dist', 'entries'), { recursive: true });
    mkdirSync(join(__dirname, 'dist', 'core'), { recursive: true });
  } catch (e) {}
  
  for (const entry of entries) {
    console.log(`📦 Building ${entry.out}...`);
    
    // ESM build
    await esbuild.build({
      ...sharedConfig,
      entryPoints: [entry.in],
      outfile: `dist/${entry.out}.mjs`,
      format: 'esm',
    });
    
    // CJS build
    await esbuild.build({
      ...sharedConfig,
      entryPoints: [entry.in],
      outfile: `dist/${entry.out}.js`,
      format: 'cjs',
    });
    
    // Check size
    const esmSize = readFileSync(`dist/${entry.out}.mjs`, 'utf-8').length;
    const cjsSize = readFileSync(`dist/${entry.out}.js`, 'utf-8').length;
    
    console.log(`  ESM: ${(esmSize / 1024).toFixed(2)}KB`);
    console.log(`  CJS: ${(cjsSize / 1024).toFixed(2)}KB`);
    console.log(`  Gzipped (est): ${(esmSize / 3 / 1024).toFixed(2)}KB\n`);
  }
  
  console.log('✅ Build complete!');
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
