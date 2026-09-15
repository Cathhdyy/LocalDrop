#!/usr/bin/env node

// Entry point for npx localdrop
const path = require('path');
const fs = require('fs');

const distCli = path.join(__dirname, '..', 'dist', 'cli.js');

if (fs.existsSync(distCli)) {
  require(distCli);
} else {
  // Try tsx / ts-node if running directly in dev
  try {
    require('tsx/cjs');
    require('../src/cli.ts');
  } catch (err) {
    console.error('LocalDrop CLI not built yet. Please run npm run build first.');
    process.exit(1);
  }
}
