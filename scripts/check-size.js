/**
 * Check bundle sizes and enforce limits
 */

const { statSync, readFileSync } = require('fs');
const { join } = require('path');
const { gzipSync } = require('zlib');

const limits = {
  'core/minimal.mjs': 1.5, // 1.5KB max
  'entries/core.mjs': 3.0,  // 3KB max
  'entries/react.mjs': 5.0, // 5KB max
  'entries/devtools.mjs': 25.0, // 25KB max (dev only)
  'entries/plugins.mjs': 15.0, // 15KB max
  'entries/utils.mjs': 8.0, // 8KB max
  'index.mjs': 25.0, // 25KB max (full bundle includes everything)
};

console.log('📏 Checking bundle sizes...\n');

let failed = false;

for (const [file, limitKB] of Object.entries(limits)) {
  const path = join(__dirname, '..', 'dist', file);
  
  try {
    const content = readFileSync(path);
    const rawSize = content.length;
    const gzipped = gzipSync(content);
    const gzipSize = gzipped.length;
    
    const rawKB = rawSize / 1024;
    const gzipKB = gzipSize / 1024;
    
    const status = gzipKB <= limitKB ? '✅' : '❌';
    const color = gzipKB <= limitKB ? '' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${status} ${file}`);
    console.log(`   Raw: ${rawKB.toFixed(2)}KB`);
    console.log(`   ${color}Gzip: ${gzipKB.toFixed(2)}KB / ${limitKB}KB limit${reset}`);
    console.log(`   Compression: ${((1 - gzipSize / rawSize) * 100).toFixed(1)}%\n`);
    
    if (gzipKB > limitKB) {
      failed = true;
    }
  } catch (err) {
    console.log(`⚠️  ${file} - not found (may not be built yet)\n`);
  }
}

if (failed) {
  console.log('❌ Some bundles exceed size limits!');
  process.exit(1);
} else {
  console.log('✅ All bundles within size limits!');
}
