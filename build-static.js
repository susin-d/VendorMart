#!/usr/bin/env node
import { execSync } from 'child_process';

try {
  console.log('Building VendorMate frontend for static deployment...');
  // Use the root vite build which has proper path resolution
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}